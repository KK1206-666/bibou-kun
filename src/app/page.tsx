'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { type Todo, type TabType } from '@/types'
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

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const filtered = todos.filter((t) => {
    if (tab === 'all')     return !t.is_routine
    if (tab === 'work')    return !t.is_routine && t.type === 'work'
    if (tab === 'private') return !t.is_routine && t.type === 'private'
    if (tab === 'routine') return t.is_routine
    return true
  })

  const active    = filtered.filter((t) => !t.is_completed)
  const completed = filtered.filter((t) => t.is_completed)

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
        <TabBar active={tab} onChange={setTab} />

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">✨</div>
            <p className="text-slate-400 text-sm">TODOはありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {active.length > 0 && (
              <div className="space-y-2">
                {active.map((todo) => (
                  <TodoItem key={todo.id} todo={todo} onUpdated={fetchTodos} />
                ))}
              </div>
            )}
            {completed.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2 px-1">完了済み（{completed.length}件）</p>
                <div className="space-y-2">
                  {completed.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} onUpdated={fetchTodos} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
