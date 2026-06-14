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
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('push_subscriptions').upsert({
      user_id: user.id,
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
        auth:   btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
      },
    }, { onConflict: 'endpoint' })
  }
}

export default function PushNotificationButton() {
  const [status, setStatus] = useState<'unknown' | 'granted' | 'denied' | 'unsupported'>('unknown')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported')
      return
    }
    if (Notification.permission === 'granted') {
      setStatus('granted')
      // OS側は許可済みでも購読データが未保存の場合があるため、毎回同期する
      subscribeAndSave().catch((err) => console.error('Push subscription sync failed:', err))
    } else if (Notification.permission === 'denied') {
      setStatus('denied')
    }
  }, [])

  async function requestPermission() {
    if (status === 'unsupported') return
    setLoading(true)

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
    }

    setLoading(false)
  }

  if (status === 'unsupported') return null
  if (status === 'granted') {
    return (
      <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 px-3 py-2 rounded-xl">
        <span>🔔</span>
        <span>プッシュ通知が有効です</span>
      </div>
    )
  }

  return (
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
  )
}
