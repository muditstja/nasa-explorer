import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {fetchTechTransfer} from '../lib/api'

export default function TechTransfer(){
  const [q,setQ] = useState('')
  const [cat,setCat] = useState<'patent'|'software'|'spinoff'>('patent')
  const query = useQuery({ queryKey:['tech',cat,q], queryFn: async()=> (await fetchTechTransfer(cat, q)) })
  return (
    <section className="card">
      <div className="row" style={{justifyContent:'space-between'}}>
        <div>
          <h3 style={{ margin: 0 }}>Tech Transfer</h3><p className="sub">Public patents, software & spinoffs</p>
        </div>
        <div className="actions wrap">
          <label className='field margin-btm-12'>Type
            <select className="select" value={cat} onChange={e=>setCat(e.target.value as any)}>
              <option value="patent">patent</option>
              <option value="software">software</option>
              <option value="spinoff">spinoff</option>
            </select>
          </label>
          <label className='field margin-btm-12'>Keyword
            <input className="input" placeholder="keywords" value={q} onChange={e=>setQ(e.target.value)} />
          </label>
        </div>
      </div>
      {query.isLoading && <div className="skeleton" style={{height:180}}/>}
      {query.isError && <div className="muted">Failed to load.</div>}
      <div className="grid g2">
        {(query.data?.results||[]).slice(0,6).map((r:any,i:number)=>(
          <div key={i} className="card" style={{padding:12}}>
            <div className="muted" style={{fontSize:12}}>Case {r[1]||'-'}</div>
            <strong>{r[2]||'Untitled'}</strong>
            <p className="muted">{r[3]||''}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
