// Push通知を送信するAPIエンドポイント
// Supabase pg_cronからこのエンドポイントを呼び出す
import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'
import { type Category, CATEGORY_MESSAGES } from '@/types'

// このエンドポイントはCronからのみ呼ばれる（認証ヘッダーで保護）
export async function POST(request: Request) {
  // VAPIDキーの初期化はリクエスト時に実施（ビルド時に実行されないよう）
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  // 現在の曜日と時刻を取得（日本時間）
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const currentDay  = dayNames[now.getDay()]
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  // リマインダーが設定されている未完了のTODOを取得
  const { data: todos } = await supabase
    .from('todos')
    .select('id, user_id, title, type, category, reminder_settings')
    .eq('is_completed', false)
    .not('reminder_settings', 'is', null)

  console.log(`[send-push] currentDay=${currentDay} currentTime=${currentTime} todos=${todos?.length ?? 0}`)

  if (!todos || todos.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  let sentCount = 0

  for (const todo of todos) {
    const settings = todo.reminder_settings as Array<{ days: string[]; time: string }>

    // 今の時刻にマッチするリマインダーがあるか確認
    const shouldNotify = settings.some((s) => {
      const timeMatch = s.time === currentTime
      const dayMatch  = s.days.length === 0 || s.days.includes(currentDay)
      return timeMatch && dayMatch
    })

    console.log(`[send-push] todo=${todo.id} title=${todo.title} settings=${JSON.stringify(settings)} shouldNotify=${shouldNotify}`)

    if (!shouldNotify) continue

    // ユーザーのPush subscriptionsを取得
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('endpoint, keys')
      .eq('user_id', todo.user_id)

    console.log(`[send-push] todo=${todo.id} subs=${subs?.length ?? 0}`)

    if (!subs || subs.length === 0) continue

    // 通知メッセージを決定
    const body = todo.type === 'private' && todo.category
      ? CATEGORY_MESSAGES[todo.category as Category]
      : CATEGORY_MESSAGES['other']

    // 各デバイスに通知を送信
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys as { p256dh: string; auth: string },
          },
          JSON.stringify({
            title: `📋 ${todo.title}`,
            body,
            icon:  '/icon-192.png',
            badge: '/icon-192.png',
          })
        )
        sentCount++
        console.log(`[send-push] sent to endpoint=${sub.endpoint.slice(0, 50)}...`)
      } catch (err) {
        // 無効なsubscriptionは削除
        console.error(`[send-push] failed to send, deleting subscription: ${err instanceof Error ? err.message : String(err)}`)
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', sub.endpoint)
      }
    }
  }

  return NextResponse.json({ sent: sentCount })
}
