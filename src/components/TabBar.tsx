'use client'

import { TABS, type TabType } from '@/types'

type Props = {
  active: TabType
  onChange: (tab: TabType) => void
}

export default function TabBar({ active, onChange }: Props) {
  return (
    <div className="flex bg-slate-900 rounded-2xl p-1 gap-1">
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex-1 py-2 px-1 rounded-xl text-xs font-semibold transition-colors ${
            active === id
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
