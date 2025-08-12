import React from 'react'
import clsx from 'clsx'

export default function TabBar({ value, onChange }) {
  const tabs = [
    { id: 'apod', label: 'APOD' },
    { id: 'neo', label: 'Near-Earth Objects' },
    { id: 'mars', label: 'Mars Rover' },
    { id: 'media', label: 'Image Library' }
  ]
  return (
    <div className="mx-auto max-w-6xl px-6">
      <div className="card flex gap-2 p-2 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id}
            onClick={() => onChange(t.id)}
            className={clsx(
              'px-3 py-2 rounded-xl whitespace-nowrap',
              value === t.id ? 'bg-white/15' : 'hover:bg-white/10'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}