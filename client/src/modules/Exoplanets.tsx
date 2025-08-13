import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

export default function Exoplanets(){
  const [yearMin,setYearMin]=useState(2015)
  const [yearMax,setYearMax]=useState(new Date().getFullYear())
  const [method,setMethod]=useState('Transit')

  const q = useQuery({ queryKey:['exo',yearMin,yearMax,method], queryFn: async()=> (await api.get(`/exo?yearMin=${yearMin}&yearMax=${yearMax}&method=${encodeURIComponent(method)}`)).data })

  return (
    <section className="card">
      <div className="row" style={{justifyContent:'space-between'}}>
        <div><h3>Exoplanet Archive</h3><p className="muted">PS Composite Parameters via TAP</p></div>
        <div className="row">
          <input className="input" type="number" value={yearMin} onChange={e=>setYearMin(+e.target.value)} />
          <input className="input" type="number" value={yearMax} onChange={e=>setYearMax(+e.target.value)} />
          <select className="select" value={method} onChange={e=>setMethod(e.target.value)}>
            <option value="">Any</option><option>Transit</option><option>Radial Velocity</option>
          </select>
        </div>
      </div>
      {q.isLoading && <div className="skeleton" style={{height:180}}/>}
      {q.isError && <div className="muted">Failed to load.</div>}
      {q.data && (
        <div className="table-wrap" style={{marginTop:8}}>
          <table className="table">
            <thead><tr><th>Planet</th><th>Host</th><th>Year</th><th>Method</th><th>Radius (R⊕)</th><th>Mass (M⊕)</th><th>Period (d)</th><th>Dist (pc)</th></tr></thead>
            <tbody>
              {q.data.rows.map((r:any,i:number)=>(
                <tr key={i}><td>{r.pl_name}</td><td>{r.hostname}</td><td>{r.disc_year}</td><td>{r.discoverymethod}</td><td>{fmt(r.pl_rade)}</td><td>{fmt(r.pl_bmasse)}</td><td>{fmt(r.pl_orbper)}</td><td>{fmt(r.sy_dist)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
function fmt(x:any){ return (x==null || Number.isNaN(x)) ? '—' : Number(x).toLocaleString() }
