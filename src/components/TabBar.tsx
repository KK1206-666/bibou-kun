'use client'

import { TABS, type TabType } from '@/types'

type Props = {
  active: TabType
  onChange: (tab: TabType) => void
  notifyCounts?: Partial<Record<TabType, number>>
}

export default function TabBar({ active, onChange, notifyCounts }: Props) {
  return (
    <div className="flex bg-slate-900 rounded-2xl p-1 gap-1">
      {TABS.map(({ id, label }) => {
        const count = notifyCounts?.[id] ?? 0
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex-1 py-2 px-0.5 rounded-xl text-[11px] font-semibold transition-colors flex flex-col items-center justify-center gap-1 ${
              active === id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="whitespace-nowrap">{label}</span>
            {count > 0 && (
              <span className="min-w-[14px] h-[14px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
