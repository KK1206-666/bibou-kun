'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  type TodoType,
  type Category,
  type ReminderSetting,
  CATEGORY_LABELS,
} from '@/types'
import ReminderSettings from './ReminderSettings'

type Props = {
  onCreated: () => void
}

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'shopping',    label: '買い物',          emoji: '🛒' },
  { value: 'reservation', label: '予約',            emoji: '📅' },
  { value: 'procedure',   label: '手続き・申請',    emoji: '📝' },
  { value: 'payment',     label: '支払い・振込',    emoji: '💳' },
  { value: 'housework',   label: '家事・タスク',    emoji: '🏠' },
  { value: 'gift',        label: 'イベント・ギフト', emoji: '🎁' },
  { value: 'other',       label: 'その他',          emoji: '📌' },
]

export default function TodoForm({ onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<TodoType>('work')
  const [isRoutine, setIsRoutine] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>('other')
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
          新しいTODOを登録する
        </span>
        <span className="text-slate-500 text-xs">{open ? '▲ 閉じる' : '▼ 開く'}</span>
      </button>

      {/* フォーム本体 */}
      {open && (
        <div className="mt-2 bg-slate-900 border border-slate-700 rounded-2xl p-4">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* タイプ切り替え */}
            <div>
              <label className="block text-xs text-slate-400 mb-2">タイプ</label>
              <div className="grid grid-cols-2 gap-2">
                {(['work', 'private'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      type === t
                        ? t === 'work'
                          ? 'bg-blue-600 text-white'
                          : 'bg-violet-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {t === 'work' ? '💼 仕事' : '🏠 プライベート'}
                  </button>
                ))}
              </div>
            </div>

            {/* タスク分類 */}
            <div>
              <label className="block text-xs text-slate-400 mb-2">タスク分類</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: false, label: '通常TODO' },
                  { value: true,  label: '定常TODO' },
                ].map(({ value, label }) => (
                  <button
                    key={String(value)}
                    type="button"
                    onClick={() => setIsRoutine(value)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isRoutine === value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* タイトル */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                タイトル <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                placeholder="例：議事録を送る"
              />
            </div>

            {/* 説明（任意） */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">説明（任意）</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm resize-none"
                placeholder="補足情報があれば"
              />
            </div>

            {/* カテゴリー（プライベートのみ） */}
            {type === 'private' && (
              <div>
                <label className="block text-xs text-slate-400 mb-2">
                  カテゴリー <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(({ value, label, emoji }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setCategory(value)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium transition-colors text-left ${
                        category === value
                          ? 'bg-violet-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {emoji} {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* リマインダー設定 */}
            <ReminderSettings reminders={reminders} onChange={setReminders} />

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
            )}

            {/* 送信 */}
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? '登録中...' : 'TODOを登録する'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
