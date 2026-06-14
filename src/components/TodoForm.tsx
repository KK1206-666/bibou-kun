'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  type TodoType,
  type Category,
  type ReminderSetting,
} from '@/types'
import TodoFormFields from './TodoFormFields'

type Props = {
  onCreated: () => void
}

export default function TodoForm({ onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<TodoType>('work')
  const [isRoutine, setIsRoutine] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>('other')
  const [dueDate, setDueDate] = useState('')
  const [reminders, setReminders] = useState<ReminderSetting[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.from('todos').insert({
      title: title.trim(),
      description: description.trim() || null,
      type,
      is_routine: isRoutine,
      category: type === 'private' ? category : null,
      due_date: !isRoutine && dueDate ? dueDate : null,
      reminder_settings: reminders.length > 0 ? reminders : null,
    })

    if (error) {
      setError('登録に失敗しました。もう一度お試しください。')
      setLoading(false)
      return
    }

    // フォームをリセット
    setTitle('')
    setDescription('')
    setType('work')
    setIsRoutine(false)
    setCategory('other')
    setDueDate('')
    setReminders([])
    setOpen(false)
    onCreated()
    setLoading(false)
  }

  return (
    <div className="mb-4">
      {/* アコーディオンヘッダー */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm font-medium text-slate-200 hover:border-indigo-500 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="text-base">＋</span>
          新しい備忘を登録する
        </span>
        <span className="text-slate-500 text-xs">{open ? '▲ 閉じる' : '▼ 開く'}</span>
      </button>

      {/* フォーム本体 */}
      {open && (
        <div className="mt-2 bg-slate-900 border border-slate-700 rounded-2xl p-4">
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

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
            )}

            {/* 送信 */}
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? '登録中...' : '備忘を登録する'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
