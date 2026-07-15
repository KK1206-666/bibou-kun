// Push通知を送信するAPIエンドポイント
// Supabase pg_cronからこのエンドポイントを呼び出す
import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'
import { type Category, type ReminderSetting, CATEGORY_MESSAGES } from '@/types'

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
const MONTHLY_ORDINAL_INDEX: Record<string, number> = { first: 0, second: 1, third: 2, fourth: 3 }

// 指定月における「第n曜日」または「最終曜日」の日付を返す（存在しない場合はnull）
function getMonthlyWeekdayDate(year: number, monthIndex: number, weekday: number, ordinal: string): Date | null {
  if (ordinal === 'last') {
    const lastDay = new Date(year, monthIndex + 1, 0)
    const diff = (lastDay.getDay() - weekday + 7) % 7
    lastDay.setDate(lastDay.getDate() - diff)
    return lastDay
  }
  const n = MONTHLY_ORDINAL_INDEX[ordinal]
  if (n === undefined) return null
  const firstDay = new Date(year, monthIndex, 1)
  const diff = (weekday - firstDay.getDay() + 7) % 7
  const date = new Date(year, monthIndex, 1 + diff + n * 7)
  return date.getMonth() === monthIndex ? date : null
}

// 隔週リマインダー：起点日から数えて何週目かを判定し、偶数週（0, 2, 4週目...）のみ通知
function isBiweeklyOnWeek(anchorDate: string, now: Date): boolean {
  const [ay, am, ad] = anchorDate.split('-').map(Number)
  const anchor = new Date(ay, am - 1, ad)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.round((today.getTime() - anchor.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return false
  return Math.floor(diffDays / 7) % 2 === 0
}

// リマインダー設定が「今」に一致するか判定
function reminderMatches(reminder: ReminderSetting, now: Date, currentDay: string, currentTime: string): boolean {
  if (reminder.time !== currentTime) return false

  if (reminder.kind === 'monthlyWeekday') {
    const weekday = WEEKDAY_INDEX[reminder.weekday]
    const target = getMonthlyWeekdayDate(now.getFullYear(), now.getMonth(), weekday, reminder.ordinal)
    if (!target) return false
    return target.getFullYear() === now.getFullYear()
      && target.getMonth() === now.getMonth()
      && target.getDate() === now.getDate()
  }

  const dayMatch = reminder.days.length === 0 || reminder.days.includes(currentDay)
  if (!dayMatch) return false
  if (reminder.biweekly && reminder.anchorDate) {
    return isBiweeklyOnWeek(reminder.anchorDate, now)
  }
  return true
}

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

  // cronからの呼び出しにはユーザーセッションが無いため、
  // RLSをバイパスできるservice_roleクライアントを使う
  const supabase = createAdminClient()

  // 現在の曜日と時刻を取得（日本時間）
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const currentDay  = dayNames[now.getDay()]
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  // YYYY-MM-DD形式の日付文字列を作成
  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const today    = formatDate(now)
  const tomorrow = formatDate(new Date(now.getTime() + 24 * 60 * 60 * 1000))

  // 期限通知を送る時刻
  const DUE_DATE_NOTIFY_TIMES = ['08:00', '12:00', '18:00', '21:00']

  // 未完了のTODOを取得
  const { data: todos, error: todosError } = await supabase
    .from('todos')
    .select('id, user_id, title, type, category, reminder_settings, due_date, is_routine')
    .eq('is_completed', false)

  console.log(`[send-push] currentDay=${currentDay} currentTime=${currentTime} todos=${todos?.length ?? 0} todosError=${todosError ? JSON.stringify(todosError) : 'none'}`)

  if (!todos || todos.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  let sentCount = 0

  for (const todo of todos) {
    const settings = (todo.reminder_settings ?? []) as ReminderSetting[]

    // 今の時刻にマッチするリマインダーがあるか確認
    const shouldNotifyReminder = settings.some((s) => reminderMatches(s, now, currentDay, currentTime))

    // 期限通知：期限の前日・当日・超過の指定時刻にマッチするか確認（定常は対象外）
    let dueDateMessage: string | null = null
    if (!todo.is_routine && todo.due_date && DUE_DATE_NOTIFY_TIMES.includes(currentTime)) {
      if (todo.due_date === today) dueDateMessage = '本日が期限です'
      else if (todo.due_date === tomorrow) dueDateMessage = '明日が期限です'
      else if (todo.due_date < today) dueDateMessage = '期限が超過しています'
    }

    const shouldNotify = shouldNotifyReminder || !!dueDateMessage

    console.log(`[send-push] todo=${todo.id} title=${todo.title} settings=${JSON.stringify(settings)} dueDate=${todo.due_date} shouldNotify=${shouldNotify}`)

    if (!shouldNotify) continue

    // ユーザーのPush subscriptionsを取得
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('endpoint, keys')
      .eq('user_id', todo.user_id)

    console.log(`[send-push] todo=${todo.id} subs=${subs?.length ?? 0}`)

    if (!subs || subs.length === 0) continue

    // 通知メッセージを決定（期限通知を優先）
    const body = dueDateMessage
      ?? (todo.type === 'private' && todo.category
        ? CATEGORY_MESSAGES[todo.category as Category]
        : CATEGORY_MESSAGES['other'])

    // 各デバイスに通知を送信
    let todoNotified = false
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
        todoNotified = true
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

    // 通知済みのTODOには通知日時を記録する（アプリ側で赤丸表示に使用）
    if (todoNotified) {
      await supabase
        .from('todos')
        .update({ notified_at: new Date().toISOString() })
        .eq('id', todo.id)
    }
  }

  return NextResponse.json({ sent: sentCount })
}
