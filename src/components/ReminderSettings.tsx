'use client'

import { DAYS_OF_WEEK, type ReminderSetting } from '@/types'

type Props = {
  reminders: ReminderSetting[]
  onChange: (reminders: ReminderSetting[]) => void
}

export default function ReminderSettings({ reminders, onChange }: Props) {
  // リマインダーを追加（初期時刻は現在時刻）
  function addReminder() {
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    onChange([...reminders, { days: [], time }])
  }

  // リマインダーを削除
  function removeReminder(index: number) {
    onChange(reminders.filter((_, i) => i !== index))
  }

  // 曜日のトグル
  function toggleDay(index: number, day: string) {
    const updated = reminders.map((r, i) => {
      if (i !== index) return r
      const days = r.days.includes(day)
        ? r.days.filter((d) => d !== day)
        : [...r.days, day]
      return { ...r, days }
    })
    onChange(updated)
  }

  // 時間を更新
  function updateTime(index: number, time: string) {
    const updated = reminders.map((r, i) => (i === index ? { ...r, time } : r))
    onChange(updated)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm text-slate-400">リマインダー通知（任意）</label>
        <button
          type="button"
          onClick={addReminder}
          className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded-lg transition-colors"
        >
          ＋ 追加
        </button>
      </div>

      {reminders.length === 0 && (
        <p className="text-xs text-slate-500 text-center py-3 border border-dashed border-slate-700 rounded-xl">
          「＋ 追加」で通知時間を設定できます
        </p>
      )}

      <div className="space-y-3">
        {reminders.map((reminder, index) => (
          <div key={index} className="bg-slate-800 rounded-xl p-3 border border-slate-700">
            {/* 曜日選択 */}
            <div className="flex items-center gap-1 mb-3 flex-wrap">
              <span className="text-xs text-slate-400 mr-1">曜日</span>
              {DAYS_OF_WEEK.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleDay(index, key)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                    reminder.days.includes(key)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
              {reminder.days.length === 0 && (
                <span className="text-xs text-slate-500 ml-1">（未選択 = 毎日）</span>
              )}
            </div>

            {/* 時間選択と削除 */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">時刻</span>
              <input
                type="time"
                value={reminder.time}
                onChange={(e) => updateTime(index, e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => removeReminder(index)}
                className="ml-auto text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
