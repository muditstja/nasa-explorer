import React, { useEffect, useState } from 'react'
import { searchMedia } from '../api'

export default function MediaPage() {
  const [q, setQ] = useState('nebula')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    setLoading(true)
    searchMedia(q).then(d => { setData(d); setErr(null) }).catch(setErr).finally(() => setLoading(false))
  }, [q])

  const items = data?.collection?.items || []

  return (
    <div className="mx-auto max-w-6xl px-6 mt-8">
      <div className="flex gap-3">
        <div className="card flex-1 p-2">
          <input
            className="w-full bg-transparent outline-none px-2 py-2"
            placeholder="Search the NASA image library…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {loading ? Array.from({length:6}).map((_,i)=><div key={i} className="h-56 rounded-xl skel" />) :
         err ? <div className="text-red-300">{String(err.message || err)}</div> :
         items.length === 0 ? <div className="text-white/60">Nothing found.</div> :
         items.slice(0,18).map((it, idx) => {
          const d = it.data?.[0]; const l = (it.links || [])[0]
          return (
            <figure key={idx} className="card overflow-hidden group">
              {l?.href ? <img src={l.href} alt={d?.title} className="w-full h-56 object-cover transition-transform group-hover:scale-[1.03]" loading="lazy" /> : <div className="h-56 skel" />}
              <figcaption className="p-3 text-sm text-white/80">{d?.title}</figcaption>
            </figure>
          )
        })}
      </div>
    </div>
  )
}