'use client'

import {
  type TodoType,
  type Category,
  type ReminderSetting,
} from '@/types'
import ReminderSettings from './ReminderSettings'

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'shopping',    label: '買い物',          emoji: '🛒' },
  { value: 'reservation', label: '予約',            emoji: '📅' },
  { value: 'procedure',   label: '手続き・申請',    emoji: '📝' },
  { value: 'payment',     label: '支払い・振込',    emoji: '💳' },
  { value: 'housework',   label: '家事・タスク',    emoji: '🏠' },
  { value: 'gift',        label: 'イベント・ギフト', emoji: '🎁' },
  { value: 'other',       label: 'その他',          emoji: '📌' },
]

type Props = {
  type: TodoType
  onTypeChange: (type: TodoType) => void
  isRoutine: boolean
  onIsRoutineChange: (isRoutine: boolean) => void
  title: string
  onTitleChange: (title: string) => void
  description: string
  onDescriptionChange: (description: string) => void
  dueDate: string
  onDueDateChange: (dueDate: string) => void
  category: Category
  onCategoryChange: (category: Category) => void
  reminders: ReminderSetting[]
  onRemindersChange: (reminders: ReminderSetting[]) => void
}

// 新規登録・編集の両方で使う入力フィールド群
export default function TodoFormFields({
  type, onTypeChange,
  isRoutine, onIsRoutineChange,
  title, onTitleChange,
  description, onDescriptionChange,
  dueDate, onDueDateChange,
  category, onCategoryChange,
  reminders, onRemindersChange,
}: Props) {
  return (
    <>
      {/* タイプ切り替え */}
      <div>
        <label className="block text-xs text-slate-400 mb-2">タイプ</label>
        <div className="grid grid-cols-2 gap-2">
          {(['work', 'private'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTypeChange(t)}
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
            { value: false, label: '通常備忘' },
            { value: true,  label: '定常TODO' },
          ].map(({ value, label }) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => onIsRoutineChange(value)}
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
          onChange={(e) => onTitleChange(e.target.value)}
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
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={2}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm resize-none"
          placeholder="補足情報があれば"
        />
      </div>

      {/* 期限（任意・定常以外） */}
      {!isRoutine && (
        <div>
          <label className="block text-xs text-slate-400 mb-1">期限（任意）</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => onDueDateChange(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
            />
            {dueDate && (
              <button
                type="button"
                onClick={() => onDueDateChange('')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-4 rounded-xl transition-colors text-sm"
              >
                クリア
              </button>
            )}
          </div>
        </div>
      )}

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
                onClick={() => onCategoryChange(value)}
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
      <ReminderSettings reminders={reminders} onChange={onRemindersChange} />
    </>
  )
}
