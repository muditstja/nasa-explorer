import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../lib/api'

export default function Apod(){
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const q = useQuery({ queryKey:['apod', date], queryFn: async()=> (await api.get(`/apod?date=${date}`)).data })
  return (
    <section className="card">
      <div className="row" style={{justifyContent:'space-between'}}>
        <div>
          <h3 style={{ margin: 0 }}>APOD
          </h3>
          <p className="muted sub">Astronomy Picture of the Day</p>
        </div>
        <div className="actions wrap">
          <label className="sub"><input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} /></label>
        </div>
      </div>
      {q.isLoading && <div className="skeleton" style={{height:200}}/>}
      {q.isError && <div className="muted">Failed to load.</div>}
      {q.data && (
        <>
          <div className="muted" style={{marginBottom:8}}>{q.data.title} — {q.data.date}</div>
          {q.data.url && (
            <img 
              src={q.data.url} 
              alt={q.data.title || 'Astronomy Picture of the Day'}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '8px',
                maxHeight: '400px',
                objectFit: 'cover'
              }}
            />
          )}
          {q.data.explanation && (
            <p className="muted" style={{marginTop: 12, fontSize: '14px', lineHeight: '1.5'}}>
              {q.data.explanation}
            </p>
          )}
        </>
      )}
    </section>
  )
}
