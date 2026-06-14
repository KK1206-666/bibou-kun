'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Sortable from 'sortablejs'
import { createClient } from '@/lib/supabase/client'
import { type Todo, type TabType, COMPLETED_RETENTION_DAYS } from '@/types'
import TodoForm from '@/components/TodoForm'
import TodoItem from '@/components/TodoItem'
import TabBar from '@/components/TabBar'
import PushNotificationButton from '@/components/PushNotificationButton'

export default function DashboardPage() {
  const router = useRouter()
  const [todos, setTodos] = useState<Todo[]>([])
  const [tab, setTab] = useState<TabType>('all')
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchTodos = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('todos')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    setTodos((data as Todo[]) ?? [])
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUserEmail(user.email ?? '')
      fetchTodos().then(() => setLoading(false))
    })
  }, [fetchTodos, router])

  // アプリを開いたらホーム画面アイコンの未読バッジを消す
  useEffect(() => {
    if ('clearAppBadge' in navigator) {
      navigator.clearAppBadge().catch(() => {})
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.getNotifications().then((notifications) => {
          notifications.forEach((n) => n.close())
        })
      })
    }
  }, [])

  // アプリを閉じた（バックグラウンドに回した）タイミングで通知済みマークを消す
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState !== 'hidden') return

      setTodos((prev) => {
        if (!prev.some((t) => t.notified_at)) return prev
        return prev.map((t) => (t.notified_at ? { ...t, notified_at: null } : t))
      })

      const supabase = createClient()
      supabase.from('todos').update({ notified_at: null }).not('notified_at', 'is', null)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  // 完了タブ：完了済みのうち、直近COMPLETED_RETENTION_DAYS日以内のもの
  // eslint-disable-next-line react-hooks/purity -- 表示期間の判定に現在時刻が必要
  const cutoff = Date.now() - COMPLETED_RETENTION_DAYS * 24 * 60 * 60 * 1000
  const completedRecent = todos
    .filter((t) => !!t.is_completed && !!t.completed_at && new Date(t.completed_at).getTime() >= cutoff)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())

  // それ以外のタブ：未完了の備忘のみ
  const filtered = todos.filter((t) => {
    if (t.is_completed) return false
    if (tab === 'all')     return !t.is_routine
    if (tab === 'work')    return !t.is_routine && t.type === 'work'
    if (tab === 'private') return !t.is_routine && t.type === 'private'
    if (tab === 'routine') return t.is_routine
    return false
  })

  const displayed = tab === 'completed' ? completedRecent : filtered

  // タブごとの通知件数（未完了かつ通知済みのもの）
  const notifyCounts: Partial<Record<TabType, number>> = {
    all:     todos.filter((t) => !t.is_completed && !t.is_routine && t.notified_at).length,
    work:    todos.filter((t) => !t.is_completed && !t.is_routine && t.type === 'work' && t.notified_at).length,
    private: todos.filter((t) => !t.is_completed && !t.is_routine && t.type === 'private' && t.notified_at).length,
    routine: todos.filter((t) => !t.is_completed && t.is_routine && t.notified_at).length,
  }

  // 並び替え：ドラッグ後の順序をDBに保存する
  const handleReorder = useCallback(async (newOrder: Todo[]) => {
    setTodos((prev) => {
      const orderMap = new Map(newOrder.map((todo, index) => [todo.id, index]))
      return prev.map((t) =>
        orderMap.has(t.id) ? { ...t, sort_order: orderMap.get(t.id)! } : t
      )
    })

    const supabase = createClient()
    await Promise.all(
      newOrder.map((todo, index) =>
        supabase.from('todos').update({ sort_order: index }).eq('id', todo.id)
      )
    )
  }, [])

  const listRef = useRef<HTMLDivElement>(null)

  // 完了タブ以外でドラッグ並び替えを有効にする
  useEffect(() => {
    if (!listRef.current || tab === 'completed') return

    const sortable = Sortable.create(listRef.current, {
      animation: 150,
      handle: '.drag-handle',
      onEnd: (evt) => {
        const { oldIndex, newIndex } = evt
        if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return
        const reordered = [...filtered]
        const [moved] = reordered.splice(oldIndex, 1)
        reordered.splice(newIndex, 0, moved)
        handleReorder(reordered)
      },
    })

    return () => sortable.destroy()
  }, [tab, filtered, handleReorder])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-sm">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <span className="font-bold text-slate-100">備忘君</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:block">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <PushNotificationButton />
        <TodoForm onCreated={fetchTodos} />
        <TabBar active={tab} onChange={setTab} notifyCounts={notifyCounts} />

        {displayed.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">✨</div>
            <p className="text-slate-400 text-sm">
              {tab === 'completed' ? '完了した備忘はありません' : '備忘はありません'}
            </p>
          </div>
        ) : (
          <div ref={listRef} className="space-y-2">
            {displayed.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onUpdated={fetchTodos} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
