'use client'

import { DAYS_OF_WEEK, ORDINALS, type ReminderSetting, type WeeklyReminder, type MonthlyWeekdayReminder, type MonthlyDayReminder } from '@/types'

type Props = {
  reminders: ReminderSetting[]
  onChange: (reminders: ReminderSetting[]) => void
}

// 現在時刻を'HH:MM'形式で取得
function currentTime() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

// 今日の日付を'YYYY-MM-DD'形式で取得
function todayDate() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export default function ReminderSettings({ reminders, onChange }: Props) {
  // 「毎週」パターンを追加（初期時刻は現在時刻、初期曜日は今日の曜日）
  function addWeekly() {
    const now = new Date()
    const today = DAYS_OF_WEEK[now.getDay()].key
    const reminder: WeeklyReminder = { kind: 'weekly', days: [today], time: currentTime() }
    onChange([...reminders, reminder])
  }

  // 「月内の第n曜日」パターンを追加
  function addMonthlyWeekday() {
    const now = new Date()
    const today = DAYS_OF_WEEK[now.getDay()].key
    const reminder: MonthlyWeekdayReminder = { kind: 'monthlyWeekday', ordinal: 'last', weekday: today, time: currentTime() }
    onChange([...reminders, reminder])
  }

  // 「毎月●日」パターンを追加（初期値は今日の日）
  function addMonthlyDay() {
    const now = new Date()
    const reminder: MonthlyDayReminder = { kind: 'monthlyDay', day: now.getDate(), time: currentTime() }
    onChange([...reminders, reminder])
  }

  // リマインダーを削除
  function removeReminder(index: number) {
    onChange(reminders.filter((_, i) => i !== index))
  }

  // 任意のフィールドを更新
  function updateReminder(index: number, patch: Partial<WeeklyReminder> & Partial<MonthlyWeekdayReminder> & Partial<MonthlyDayReminder>) {
    const updated = reminders.map((r, i) => (i === index ? { ...r, ...patch } : r))
    onChange(updated as ReminderSetting[])
  }

  // 曜日のトグル（毎週パターン用）
  function toggleDay(index: number, day: string) {
    const reminder = reminders[index] as WeeklyReminder
    const days = reminder.days.includes(day)
      ? reminder.days.filter((d) => d !== day)
      : [...reminder.days, day]
    updateReminder(index, { days })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm text-slate-400">リマインダー通知（任意）</label>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={addWeekly}
            className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded-lg transition-colors"
          >
            ＋ 毎週/隔週
          </button>
          <button
            type="button"
            onClick={addMonthlyWeekday}
            className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded-lg transition-colors"
          >
            ＋ 月内の曜日
          </button>
          <button
            type="button"
            onClick={addMonthlyDay}
            className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded-lg transition-colors"
          >
            ＋ 毎月●日
          </button>
        </div>
      </div>

      {reminders.length === 0 && (
        <p className="text-xs text-slate-500 text-center py-3 border border-dashed border-slate-700 rounded-xl">
          「＋」から通知パターンを追加できます
        </p>
      )}

      <div className="space-y-3">
        {reminders.map((reminder, index) => {
          const isMonthly = reminder.kind === 'monthlyWeekday'

          if (isMonthly) {
            const r = reminder as MonthlyWeekdayReminder
            return (
              <div key={index} className="bg-slate-800 rounded-xl p-3 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-indigo-300 font-medium">月内の曜日</span>
                  <button
                    type="button"
                    onClick={() => removeReminder(index)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    削除
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={r.ordinal}
                    onChange={(e) => updateReminder(index, { ordinal: e.target.value as MonthlyWeekdayReminder['ordinal'] })}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {ORDINALS.map(({ key, label }) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>

                  <select
                    value={r.weekday}
                    onChange={(e) => updateReminder(index, { weekday: e.target.value })}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {DAYS_OF_WEEK.map(({ key, label }) => (
                      <option key={key} value={key}>{label}曜日</option>
                    ))}
                  </select>

                  <input
                    type="time"
                    value={r.time}
                    onChange={(e) => updateReminder(index, { time: e.target.value })}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )
          }

          if (reminder.kind === 'monthlyDay') {
            const r = reminder as MonthlyDayReminder
            return (
              <div key={index} className="bg-slate-800 rounded-xl p-3 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-indigo-300 font-medium">毎月●日</span>
                  <button
                    type="button"
                    onClick={() => removeReminder(index)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    削除
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={String(r.day)}
                    onChange={(e) => updateReminder(index, { day: e.target.value === 'last' ? 'last' : Number(e.target.value) })}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>{d}日</option>
                    ))}
                    <option value="last">末日</option>
                  </select>

                  <input
                    type="time"
                    value={r.time}
                    onChange={(e) => updateReminder(index, { time: e.target.value })}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                {typeof r.day === 'number' && (
                  <p className="text-xs text-slate-500 mt-2">※その月に{r.day}日が無い場合は、末日に繰り下げて通知します</p>
                )}
              </div>
            )
          }

          const r = reminder as WeeklyReminder
          return (
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
                      r.days.includes(key)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                {r.days.length === 0 && (
                  <span className="text-xs text-slate-500 ml-1">（未選択 = 毎日）</span>
                )}
              </div>

              {/* 時間選択と削除 */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-slate-400">時刻</span>
                <input
                  type="time"
                  value={r.time}
                  onChange={(e) => updateReminder(index, { time: e.target.value })}
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

              {/* 隔週トグル */}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!r.biweekly}
                    onChange={(e) =>
                      updateReminder(index, {
                        biweekly: e.target.checked,
                        anchorDate: e.target.checked ? (r.anchorDate ?? todayDate()) : undefined,
                      })
                    }
                    className="w-3.5 h-3.5"
                  />
                  隔週にする
                </label>
                {r.biweekly && (
                  <>
                    <span className="text-xs text-slate-400">起点日</span>
                    <input
                      type="date"
                      value={r.anchorDate ?? todayDate()}
                      onChange={(e) => updateReminder(index, { anchorDate: e.target.value })}
                      className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
