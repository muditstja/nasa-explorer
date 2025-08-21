import { useQuery } from '@tanstack/react-query'
import {fetchMars} from '../services/api.service'
import { useState } from 'react'

export default function Mars() {
  const [rover, setRover] = useState<'curiosity'|'opportunity'|'spirit'>('curiosity')
  const [camera, setCamera] = useState<string>('')
  const [mode, setMode] = useState<'earth'|'sol'>('earth')
  const [date, setDate] = useState('2015-06-03')
  const [sol, setSol] = useState<number>(1000)

  const params = new URLSearchParams()
  params.set('rover', rover)
  if (mode==='earth') params.set('earth_date', date)
  else params.set('sol', String(sol))
  if (camera) params.set('camera', camera)

  const q = useQuery({
    queryKey: ['mars', rover, camera, mode, date, sol],
    queryFn: async () => (await fetchMars(params))  })

  const photos = (q.data?.photos||[]) as any[]

  return (
    <section id="mars" className="card p-4 module">
      <div className="card-head">
        <div>
          <h3 style={{ margin: 0 }}>Mars Rover Photos</h3>
          <p className="muted sub">Browse Curiosity / Opportunity / Spirit shots by date or sol and camera.</p>
        </div>
        <div className="actions wrap margin-btm-12">
          <label className="field">Rover
            <select className="select" value={rover} onChange={e=>setRover(e.target.value as any)}>
              <option value="curiosity">Curiosity</option>
              <option value="opportunity">Opportunity</option>
              <option value="spirit">Spirit</option>
            </select>
          </label>
          <label className="field">Camera
            <select className="select" value={camera} onChange={e=>setCamera(e.target.value)}>
              <option value="">Any camera</option>
              <option value="FHAZ">FHAZ</option>
              <option value="RHAZ">RHAZ</option>
              <option value="MAST">MAST</option>
              <option value="NAVCAM">NAVCAM</option>
              <option value="PANCAM">PANCAM</option>
            </select>
          </label>
          <label className="field">Camera
          <select className="select" value={mode} onChange={e=>setMode(e.target.value as any)}>
            <option value="earth">Earth date</option>
            <option value="sol">Sol (Martian day)</option>
          </select>
          </label>
          {mode==='earth' ? (
            <label className="field">Date
              <input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} />
            </label>
          ) : (
            
            <label className="field">Number
            <input className="input" type="number" min={0} max={5000} value={sol} onChange={e=>setSol(+e.target.value)} />
            </label>
          )}
        </div>
      </div>
      {q.isLoading && <div className="skeleton" style={{ height: 180 }} />}
      {q.isError && <div className="muted">Failed to load.</div>}
      <div className="grid g2">
        {photos.slice(0,8).map((p:any) => (
          <figure key={p.id} className="media" style={{margin:0}}>
            <img src={p.img_src} alt={`Mars ${p.camera?.full_name||p.camera?.name||''}`} style={{width:'100%',borderRadius:12,display:'block'}}/>
            <figcaption className="muted" style={{marginTop:6,fontSize:12}}>
              {p.camera?.full_name || p.camera?.name} — {p.earth_date} (Sol {p.sol})
            </figcaption>
          </figure>
        ))}
        {!q.isLoading && photos.length===0 && <div className="muted">No photos found for selected filters.</div>}
      </div>
    </section>
  )
}
