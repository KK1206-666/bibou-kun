'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// VAPID公開鍵をUint8Arrayに変換するヘルパー
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

// Service Workerを登録し、Push subscriptionをSupabaseに保存する
async function subscribeAndSave() {
  const registration = await navigator.serviceWorker.register('/sw.js')

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
    ),
  })

  const supabase = createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) {
    throw new Error(`ユーザー情報の取得に失敗: ${userError.message}`)
  }
  if (!user) {
    throw new Error('ログイン情報が見つかりませんでした')
  }

  const { error: upsertError } = await supabase.from('push_subscriptions').upsert({
    user_id: user.id,
    endpoint: subscription.endpoint,
    keys: {
      p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
      auth:   btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
    },
  }, { onConflict: 'endpoint' })

  if (upsertError) {
    throw new Error(`購読情報の保存に失敗: ${upsertError.message}`)
  }
}

export default function PushNotificationButton() {
  const [status, setStatus] = useState<'unknown' | 'granted' | 'denied' | 'unsupported' | 'needs-install'>('unknown')
  const [loading, setLoading] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  useEffect(() => {
    // iOSのSafariはホーム画面に追加（PWAインストール）していないとPush通知が使えない
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const isStandalone = (window.navigator as { standalone?: boolean }).standalone === true
      || window.matchMedia('(display-mode: standalone)').matches

    if (isIOS && !isStandalone) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- ブラウザ環境の判定はマウント後にしか行えないため
      setStatus('needs-install')
      return
    }

    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported')
      return
    }
    if (Notification.permission === 'granted') {
      setStatus('granted')
      // OS側は許可済みでも購読データが未保存の場合があるため、毎回同期する
      subscribeAndSave().catch((err) => {
        console.error('Push subscription sync failed:', err)
        setSyncError(err instanceof Error ? err.message : String(err))
      })
    } else if (Notification.permission === 'denied') {
      setStatus('denied')
    }
  }, [])

  async function requestPermission() {
    if (status === 'unsupported') return
    setLoading(true)
    setSyncError(null)

    try {
      // 通知許可をリクエスト
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus('denied')
        setLoading(false)
        return
      }

      await subscribeAndSave()
      setStatus('granted')
    } catch (err) {
      console.error('Push notification setup failed:', err)
      setSyncError(err instanceof Error ? err.message : String(err))
    }

    setLoading(false)
  }

  if (status === 'unsupported') return null

  if (status === 'needs-install') {
    return (
      <div className="text-xs text-amber-300 bg-amber-400/10 px-3 py-2 rounded-xl">
        🔔 通知を有効にするには、共有ボタンから「ホーム画面に追加」してください（iPhone）
      </div>
    )
  }

  if (status === 'granted') {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 px-3 py-2 rounded-xl">
          <span>🔔</span>
          <span>プッシュ通知が有効です</span>
        </div>
        {syncError && (
          <div className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-xl break-all">
            購読の同期に失敗しました: {syncError}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={requestPermission}
        disabled={loading || status === 'denied'}
        className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl transition-colors font-medium ${
          status === 'denied'
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
            : 'bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30'
        }`}
      >
        <span>🔔</span>
        <span>
          {loading ? '設定中...' : status === 'denied' ? '通知がブロックされています' : '通知を許可する'}
        </span>
      </button>
      {syncError && (
        <div className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-xl break-all">
          エラー: {syncError}
        </div>
      )}
    </div>
  )
}
