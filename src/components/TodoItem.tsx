'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  type Todo,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  DAYS_OF_WEEK,
} from '@/types'
import EditTodoModal from './EditTodoModal'

type Props = {
  todo: Todo
  onUpdated: () => void
}

export default function TodoItem({ todo, onUpdated }: Props) {
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)

  // 完了/未完了を切り替え
  async function toggleComplete() {
    setLoading(true)
    const supabase = createClient()
    const willComplete = !todo.is_completed
    await supabase
      .from('todos')
      .update({
        is_completed: willComplete,
        completed_at: willComplete ? new Date().toISOString() : null,
      })
      .eq('id', todo.id)
    onUpdated()
    setLoading(false)
  }

  // 削除
  async function deleteTodo() {
    if (!confirm(`「${todo.title}」を削除しますか？`)) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('todos').delete().eq('id', todo.id)
    onUpdated()
    setLoading(false)
  }

  // リマインダーの表示テキスト
  function formatReminder(days: string[], time: string) {
    if (days.length === 0) return `毎日 ${time}`
    const labels = days
      .map((d) => DAYS_OF_WEEK.find((w) => w.key === d)?.label ?? d)
      .join('・')
    return `${labels} ${time}`
  }

  // 期限の表示テキストと、期限切れかどうか
  function formatDueDate(dueDate: string) {
    const [, month, day] = dueDate.split('-')
    return `${Number(month)}/${Number(day)}`
  }

  const isOverdue = !!todo.due_date
    && !todo.is_completed
    && todo.due_date < new Date().toISOString().slice(0, 10)

  const typeColor = todo.type === 'work'
    ? 'border-l-blue-500'
    : 'border-l-violet-500'

  return (
    <div
      className={`bg-slate-900 border border-slate-800 border-l-2 ${typeColor} rounded-xl p-4 transition-opacity ${
        todo.is_completed ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* ドラッグハンドル */}
        <div
          className="drag-handle cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 text-base leading-none pt-0.5 select-none touch-none flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          ⠿
        </div>

        {/* チェックボックス */}
        <input
          type="checkbox"
          checked={todo.is_completed}
          onChange={toggleComplete}
          disabled={loading}
          className="mt-0.5 w-5 h-5 rounded cursor-pointer flex-shrink-0"
        />

        {/* コンテンツ（タップで編集） */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setEditing(true)}>
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-sm font-medium leading-snug ${
                todo.is_completed ? 'line-through text-slate-500' : 'text-slate-100'
              }`}
            >
              {todo.title}
            </p>

            {/* 削除・完了ボタン */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <button
                onClick={deleteTodo}
                disabled={loading}
                className="text-slate-600 hover:text-red-400 transition-colors text-lg leading-none"
              >
                ×
              </button>
              <button
                onClick={toggleComplete}
                disabled={loading}
                title={todo.is_completed ? '未完了に戻す' : '完了にする'}
                className={`transition-colors text-base leading-none ${
                  todo.is_completed ? 'text-emerald-400' : 'text-slate-600 hover:text-emerald-400'
                }`}
              >
                ✓
              </button>
            </div>
          </div>

          {/* 説明 */}
          {todo.description && (
            <p className="text-xs text-slate-500 mt-1 whitespace-pre-wrap">{todo.description}</p>
          )}

          {/* バッジ行 */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {/* タイプバッジ */}
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                todo.type === 'work'
                  ? 'bg-blue-500/15 text-blue-300'
                  : 'bg-violet-500/15 text-violet-300'
              }`}
            >
              {todo.type === 'work' ? '💼 仕事' : '🏠 プライベート'}
            </span>

            {/* 定常バッジ */}
            {todo.is_routine && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-medium">
                🔁 定常
              </span>
            )}

            {/* カテゴリーバッジ（プライベートのみ） */}
            {todo.type === 'private' && todo.category && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  CATEGORY_COLORS[todo.category]
                }`}
              >
                {CATEGORY_LABELS[todo.category]}
              </span>
            )}

            {/* 期限バッジ */}
            {todo.due_date && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isOverdue
                    ? 'bg-red-500/15 text-red-300'
                    : 'bg-slate-500/15 text-slate-300'
                }`}
              >
                ⏰ 期限 {formatDueDate(todo.due_date)}
              </span>
            )}
          </div>

          {/* リマインダー表示 */}
          {todo.reminder_settings && todo.reminder_settings.length > 0 && (
            <div className="mt-2 space-y-1">
              {todo.reminder_settings.map((r, i) => (
                <div key={i} className="flex items-center gap-1 text-xs text-slate-500">
                  <span>🔔</span>
                  <span>{formatReminder(r.days, r.time)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 編集モーダル */}
      {editing && (
        <EditTodoModal todo={todo} onClose={() => setEditing(false)} onUpdated={onUpdated} />
      )}
    </div>
  )
}
