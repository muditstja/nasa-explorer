import React, { useEffect, useMemo, useState } from 'react'
import { fetchNEO } from '../api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

function formatDate(d) { return d.toISOString().slice(0,10) }

export default function NEOPage() {
  const [range, setRange] = useState(() => {
    const end = new Date(); const start = new Date(end); start.setDate(end.getDate()-6)
    return { start, end }
  })
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetchNEO(formatDate(range.start), formatDate(range.end))
      .then(setData).catch(setErr).finally(() => setLoading(false))
  }, [range.start, range.end])

  const rows = useMemo(() => {
    if (!data?.near_earth_objects) return []
    return Object.entries(data.near_earth_objects)
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([date, items]) => ({
        date,
        count: items.length,
        hazardous: items.filter(n => n.is_potentially_hazardous_asteroid).length
      }))
  }, [data])

  return (
    <div className="mx-auto max-w-6xl px-6 mt-8">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="card p-3">
          <label className="text-xs text-white/60">Start</label>
          <input type="date" className="bg-transparent outline-none" value={formatDate(range.start)}
            max={formatDate(range.end)}
            onChange={e => setRange(r => ({...r, start: new Date(e.target.value)}))}
          />
        </div>
        <div className="card p-3">
          <label className="text-xs text-white/60">End</label>
          <input type="date" className="bg-transparent outline-none" value={formatDate(range.end)}
            min={formatDate(range.start)}
            onChange={e => setRange(r => ({...r, end: new Date(e.target.value)}))}
          />
        </div>
      </div>

      <div className="mt-6 card p-4 h-80">
        {loading ? <div className="w-full h-full skel rounded-xl" /> :
          err ? <div className="text-red-300">Failed to load: {String(err.message || err)}</div> :
          rows.length === 0 ? <div className="text-white/60">No data in this range.</div> :
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)"/>
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.6)' }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.6)' }} />
              <Tooltip contentStyle={{ background:'rgba(20,24,44,.95)', border:'1px solid rgba(255,255,255,.1)', borderRadius:12 }}/>
              <Line type="monotone" dataKey="count" stroke="currentColor" dot={false} />
              <Line type="monotone" dataKey="hazardous" stroke="currentColor" strokeDasharray="4 2" dot={false} />
            </LineChart>
          </ResponsiveContainer>}
      </div>
    </div>
  )
}