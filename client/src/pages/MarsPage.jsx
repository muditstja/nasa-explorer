import React, { useEffect, useState } from 'react'
import { fetchMars } from '../api'

const cameras = ['', 'FHAZ','RHAZ','MAST','CHEMCAM','MAHLI','MARDI','NAVCAM']

export default function MarsPage() {
  const [params, setParams] = useState({ rover: 'curiosity', sol: 1000, camera: '', page: 1 })
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetchMars(params).then(d => { setData(d); setErr(null) }).catch(setErr).finally(() => setLoading(false))
  }, [params.rover, params.sol, params.camera, params.page])

  const photos = data?.photos || []

  return (
    <div className="mx-auto max-w-6xl px-6 mt-8">
      <div className="flex flex-wrap gap-2 items-end">
        <Select label="Rover" value={params.rover} onChange={v => setParams(p => ({...p, rover: v}))}
          options={['curiosity','opportunity','spirit']} />
        <Number label="Sol" value={params.sol} onChange={v => setParams(p => ({...p, sol: v}))} min={0} max={4000} />
        <Select label="Camera" value={params.camera} onChange={v => setParams(p => ({...p, camera: v}))}
          options={cameras} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {loading ? Array.from({length:6}).map((_,i)=><div key={i} className="h-56 rounded-xl skel" />) :
         err ? <div className="text-red-300">{String(err.message || err)}</div> :
         photos.length === 0 ? <div className="text-white/60">No photos for that combo.</div> :
         photos.map(p => (
          <figure key={p.id} className="card overflow-hidden group">
            <img src={p.img_src} alt={p.camera.full_name} className="w-full h-56 object-cover transition-transform group-hover:scale-[1.03]" loading="lazy"/>
            <figcaption className="p-3 text-sm text-white/70">
              {p.rover.name} • Sol {p.sol} • {p.camera.name}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="card p-3">
      <span className="text-xs text-white/60">{label}</span>
      <select className="bg-transparent outline-none" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o} value={o}>{o || 'Any'}</option>)}
      </select>
    </label>
  )
}
function Number({ label, value, onChange, min, max }) {
  return (
    <label className="card p-3">
      <span className="text-xs text-white/60">{label}</span>
      <input type="number" className="bg-transparent outline-none w-28" value={value} min={min} max={max}
        onChange={e => onChange(Number(e.target.value))}
      />
    </label>
  )
}