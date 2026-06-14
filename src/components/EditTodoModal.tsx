'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  type Todo,
  type TodoType,
  type Category,
  type ReminderSetting,
} from '@/types'
import TodoFormFields from './TodoFormFields'

type Props = {
  todo: Todo
  onClose: () => void
  onUpdated: () => void
}

export default function EditTodoModal({ todo, onClose, onUpdated }: Props) {
  const [type, setType] = useState<TodoType>(todo.type)
  const [isRoutine, setIsRoutine] = useState(todo.is_routine)
  const [title, setTitle] = useState(todo.title)
  const [description, setDescription] = useState(todo.description ?? '')
  const [category, setCategory] = useState<Category>(todo.category ?? 'other')
  const [dueDate, setDueDate] = useState(todo.due_date ?? '')
  const [reminders, setReminders] = useState<ReminderSetting[]>(todo.reminder_settings ?? [])
  const [appendText, setAppendText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 説明欄に日付付きで状況を追記する
  function handleAppend() {
    if (!appendText.trim()) return
    const now = new Date()
    const line = `・${now.getMonth() + 1}/${now.getDate()} ${appendText.trim()}`
    setDescription((prev) => (prev ? `${prev}\n${line}` : line))
    setAppendText('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase
      .from('todos')
      .update({
        title: title.trim(),
        description: description.trim() || null,
        type,
        is_routine: isRoutine,
        category: type === 'private' ? category : null,
        due_date: !isRoutine && dueDate ? dueDate : null,
        reminder_settings: reminders.length > 0 ? reminders : null,
      })
      .eq('id', todo.id)

    if (error) {
      setError('更新に失敗しました。もう一度お試しください。')
      setLoading(false)
      return
    }

    onUpdated()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl p-4 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-100">備忘を編集</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-200 text-lg leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TodoFormFields
            type={type} onTypeChange={setType}
            isRoutine={isRoutine} onIsRoutineChange={setIsRoutine}
            title={title} onTitleChange={setTitle}
            description={description} onDescriptionChange={setDescription}
            dueDate={dueDate} onDueDateChange={setDueDate}
            category={category} onCategoryChange={setCategory}
            reminders={reminders} onRemindersChange={setReminders}
          />

          {/* 状況を追記 */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">状況を追記</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={appendText}
                onChange={(e) => setAppendText(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                placeholder="例：予約完了"
              />
              <button
                type="button"
                onClick={handleAppend}
                disabled={!appendText.trim()}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-medium px-4 rounded-xl transition-colors text-sm"
              >
                追記
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? '更新中...' : '更新する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
