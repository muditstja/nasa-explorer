import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'

type NEO = any

function useCanvasSize(canvas: HTMLCanvasElement | null){
  const [size, setSize] = useState({w:0,h:0,ratio:1})
  useEffect(()=>{
    if (!canvas) return
    const ro = new ResizeObserver(()=>{
      const r = Math.min(2, window.devicePixelRatio||1)
      const box = canvas.getBoundingClientRect()
      canvas.width = Math.floor(box.width * r)
      canvas.height = Math.floor(box.height * r)
      const ctx = canvas.getContext('2d')!
      ctx.setTransform(r,0,0,r,0,0)
      setSize({w: box.width, h: box.height, ratio: r})
    })
    ro.observe(canvas)
    return ()=>ro.disconnect()
  }, [canvas])
  return size
}

export default function NeoOrbit(){
  const [start,setStart]=useState(()=> new Date(Date.now()-2*86400000).toISOString().slice(0,10))
  const [end,setEnd]=useState(()=> new Date(Date.now()+2*86400000).toISOString().slice(0,10))
  const [hazOnly,setHazOnly]=useState(false)
  const [showRings,setShowRings]=useState(true)
  const [animate,setAnimate]=useState(true)
  const [timeOffset,setTimeOffset]=useState(0)

  const q = useQuery({
    queryKey:['neo',start,end],
    queryFn: async()=> (await api.get(`/neo?start_date=${start}&end_date=${end}`)).data,
  })

  const objects: NEO[] = useMemo(()=>{
    const rows = (q.data?.objects||[]) as NEO[]
    return rows.map((o, i)=>{
      const ca = o.close_approach_data?.[0] || {}
      const missKm = +(ca.miss_distance?.kilometers || 0)
      const vel = +(ca.relative_velocity?.kilometers_per_hour || 0)
      const diamMin = o.estimated_diameter?.meters?.estimated_diameter_min || 0
      const diamMax = o.estimated_diameter?.meters?.estimated_diameter_max || 0
      const diam = (diamMin + diamMax)/2
      const date = ca.close_approach_date_full || ca.close_approach_date
      const hazard = !!o.is_potentially_hazardous_asteroid
      const ecc = Math.min(0.6, (vel/120000))
      const period = 8 + (i%20)
      return { id:o.id, name:o.name, missKm, vel, diam, date, hazard, ecc, period, angle0: (i*137.5)%360 * Math.PI/180 }
    }).filter(o=> o.missKm>0 && o.vel>0 && o.diam>0)
  }, [q.data])

  return (
    <section className="card">
      {objects.length > 0 && (
        <div style={{marginTop: 16}}>
          <h4 style={{margin: '0 0 16px 0', color: '#666'}}>NEO Statistics</h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              padding: '20px',
              borderRadius: '12px',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '8px'}}>
                {objects.length}
              </div>
              <div style={{fontSize: '14px', opacity: 0.9}}>Near Earth Objects</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              padding: '20px',
              borderRadius: '12px',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '8px'}}>
                {Math.round(objects.reduce((sum, o) => sum + o.missKm, 0) / objects.length).toLocaleString()}
              </div>
              <div style={{fontSize: '14px', opacity: 0.9}}>Avg Miss Distance (km)</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              padding: '20px',
              borderRadius: '12px',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '8px'}}>
                {Math.round(objects.reduce((sum, o) => sum + o.vel, 0) / objects.length).toLocaleString()}
              </div>
              <div style={{fontSize: '14px', opacity: 0.9}}>Avg Velocity (km/h)</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              padding: '20px',
              borderRadius: '12px',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '8px'}}>
                {objects.filter(o => o.hazard).length}
              </div>
              <div style={{fontSize: '14px', opacity: 0.9}}>Potentially Hazardous</div>
            </div>
          </div>
          
          {/* Bar Chart */}
          {/* <div style={{
            background: '#f8fafc',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h5 style={{margin: '0 0 16px 0', color: '#374151'}}>Distribution Analysis</h5>
            <div style={{display: 'flex', alignItems: 'end', gap: '8px', height: '120px'}}>
              {objects.slice(0, 10).map((o, i) => {
                const maxMiss = Math.max(...objects.map(obj => obj.missKm))
                const maxVel = Math.max(...objects.map(obj => obj.vel))
                const missHeight = (o.missKm / maxMiss) * 80
                const velHeight = (o.vel / maxVel) * 80
                
                return (
                  <div key={o.id} style={{flex: 1, textAlign: 'center'}}>
                    <div style={{
                      height: `${missHeight}px`,
                      background: 'linear-gradient(to top, #3b82f6, #60a5fa)',
                      borderRadius: '4px 4px 0 0',
                      marginBottom: '4px',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '0',
                        right: '0',
                        height: `${velHeight}px`,
                        background: 'linear-gradient(to top, #f59e0b, #fbbf24)',
                        borderRadius: '4px 4px 0 0'
                      }} />
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: '#6b7280',
                      transform: 'rotate(-45deg)',
                      transformOrigin: 'top left',
                      whiteSpace: 'nowrap',
                      marginTop: '8px'
                    }}>
                      {o.name.slice(0, 8)}
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              marginTop: '16px',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <div style={{width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px'}}></div>
                <span>Miss Distance</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <div style={{width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px'}}></div>
                <span>Velocity</span>
              </div>
            </div>
          </div> */}
        </div>
      )}
      
      <div className="row" style={{justifyContent:'space-between'}}>
        <div><h3>Near‑Earth Objects</h3><p className="muted">Earth‑centric orbits. Hover for details; click for side panel.</p></div>
        <div className="row">
          <input className="input" type="date" value={start} onChange={e=>setStart(e.target.value)} />
          <input className="input" type="date" value={end} onChange={e=>setEnd(e.target.value)} />
          <label className="row"><input type="checkbox" checked={hazOnly} onChange={e=>setHazOnly(e.target.checked)}/> <span className="muted">Hazardous</span></label>
          <label className="row"><input type="checkbox" checked={showRings} onChange={e=>setShowRings(e.target.checked)}/> <span className="muted">Rings</span></label>
          <label className="row"><input type="checkbox" checked={animate} onChange={e=>setAnimate(e.target.checked)}/> <span className="muted">Animate</span></label>
        </div>
      </div>
      <CanvasOrbit objects={objects} hazOnly={hazOnly} showRings={showRings} animate={animate} timeOffset={timeOffset} onTimeOffset={setTimeOffset}/>
      {q.isLoading && <div className="skeleton" style={{height:10, marginTop:8}}/>}
      {q.isError && <div className="muted">Failed to load NEO feed.</div>}

      
      
    </section>
  )
}

function CanvasOrbit({objects, hazOnly, showRings, animate, timeOffset, onTimeOffset}:{objects:NEO[],hazOnly:boolean,showRings:boolean,animate:boolean,timeOffset:number,onTimeOffset:(n:number)=>void}){
  const ref = useRef<HTMLCanvasElement|null>(null)
  const tipRef = useRef<HTMLDivElement|null>(null)
  const panelRef = useRef<HTMLDivElement|null>(null)
  const [sel, setSel] = useState<NEO|null>(null)
  const {w,h} = useCanvasSize(ref.current)

  const [scale,setScale]=useState(1)
  const [ox,setOx]=useState(0)
  const [oy,setOy]=useState(0)
  useEffect(()=>{ setScale(1); setOx(0); setOy(0) }, [objects.length])

  useEffect(()=>{
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    let raf=0, dragging=false, lx=0, ly=0

    function worldToScreen(x:number,y:number){ return { x: (w/2 + ox) + x*scale, y: (h/2 + oy) + y*scale } }

    function draw(time:number){
      ctx.clearRect(0,0,w,h)
      ctx.save()
      ctx.translate(w/2+ox, h/2+oy)
      ctx.scale(scale, scale)

      const earthR=26
      const glow = ctx.createRadialGradient(0,0,earthR*.5,0,0,earthR*3)
      glow.addColorStop(0,'rgba(102,197,255,.45)'); glow.addColorStop(1,'rgba(102,197,255,0)')
      ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(0,0,earthR*3,0,Math.PI*2); ctx.fill()
      const sunAng = time*.00003
      const grad = ctx.createLinearGradient(Math.cos(sunAng)*earthR, Math.sin(sunAng)*earthR, -Math.cos(sunAng)*earthR, -Math.sin(sunAng)*earthR)
      grad.addColorStop(0,'#3cc3ff'); grad.addColorStop(1,'#0a1a2a')
      ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(0,0,earthR,0,Math.PI*2); ctx.fill()
      ctx.strokeStyle='#a6e1ff88'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(0,0,earthR,0,Math.PI*2); ctx.stroke()

      const pxPerKm = 1/4000
      const base = earthR + 12

      const list = (hazOnly? objects.filter(o=>o.hazard): objects).slice(0,120)
      list.forEach((o,i)=>{
        const a0 = o.angle0
        const angle = a0 + (animate ? time*.0003/o.period : 0) + timeOffset*.15
        const a = Math.min((o.missKm*pxPerKm)+base, Math.min(w,h)/2 - 20)
        const b = a * (1 - o.ecc*0.6)
        const phi = (i/list.length) * Math.PI
        if (showRings && a > 0 && b > 0){
          ctx.save()
          ctx.rotate(phi)
          ctx.strokeStyle='#ffffff10'; ctx.lineWidth=1
          ctx.beginPath(); ctx.ellipse(0,0,a,b,0,0,Math.PI*2); ctx.stroke()
          ctx.restore()
        }
        const x = a * Math.cos(angle), y = b * Math.sin(angle)
        const xr =  x*Math.cos(phi) - y*Math.sin(phi)
        const yr =  x*Math.sin(phi) + y*Math.cos(phi)
        const r = Math.max(2, Math.min(6, o.diam/100))
        ctx.fillStyle = o.hazard? '#ff7b72' : '#cfe8ff'
        ctx.beginPath(); ctx.arc(xr, yr, r, 0, Math.PI*2); ctx.fill()
        const sp = worldToScreen(xr, yr)
        ;(o as any).__x = sp.x; (o as any).__y = sp.y; (o as any).__r = r*scale
      })

      ctx.restore()
      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)

    function onDown(e:PointerEvent){ dragging=true; lx=e.clientX; ly=e.clientY; canvas.setPointerCapture(e.pointerId) }
    function onUp(e:PointerEvent){ dragging=false; canvas.releasePointerCapture(e.pointerId) }
    function onMove(e:PointerEvent){ if (dragging){ setOx(v=>v+(e.clientX-lx)); setOy(v=>v+(e.clientY-ly)); lx=e.clientX; ly=e.clientY } }
    function onWheel(e:WheelEvent){ e.preventDefault(); const f = e.deltaY>0? 1/1.1 : 1.1; setScale(s=> Math.min(2.5, Math.max(.5, s*f))) }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('wheel', onWheel, { passive:false })
    return ()=>{
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('wheel', onWheel)
    }
  }, [ref.current, w, h, ox, oy, scale, animate, timeOffset, showRings, objects, hazOnly])

  useEffect(()=>{
    const canvas = ref.current!, tip = tipRef.current!, panel = panelRef.current!
    function hit(mx:number,my:number){
      let best:any=null, min=12
      for (const o of (hazOnly? objects.filter(x=>x.hazard): objects)){
        const dx = mx - (o as any).__x, dy = my - (o as any).__y
        const d = Math.hypot(dx, dy)
        if (d < Math.max(8, (o as any).__r+6) && d < min){ min=d; best=o }
      }
      return best
    }
    function mm(e:MouseEvent){
      const r = canvas.getBoundingClientRect()
      const mx = e.clientX - r.left, my = e.clientY - r.top
      const o:any = hit(mx,my)
      if (o){
        tip.hidden=false; tip.style.left=`${(o as any).__x}px`; tip.style.top=`${(o as any).__y}px`
        tip.innerHTML = `<strong>${o.name}</strong><br/>Miss: ${Math.round(o.missKm).toLocaleString()} km<br/>Speed: ${Math.round(o.vel).toLocaleString()} km/h<br/>Diam: ${Math.round(o.diam)} m<br/>Date: ${o.date}`
      } else { tip.hidden=true }
    }
    function click(e:MouseEvent){
      const r = canvas.getBoundingClientRect()
      const mx = e.clientX - r.left, my = e.clientY - r.top
      const o:any = hit(mx,my)
      if (o){ setSel(o) }
    }
    canvas.addEventListener('mousemove', mm)
    canvas.addEventListener('mouseleave', ()=> tip.hidden=true)
    canvas.addEventListener('click', click)
    return ()=>{ canvas.removeEventListener('mousemove', mm); canvas.removeEventListener('mouseleave', ()=> tip.hidden=true); canvas.removeEventListener('click', click) }
  }, [objects, hazOnly])

  return (
    <div>
      <div className="row" style={{justifyContent:'space-between', margin:'8px 0 6px'}}>
        <div className="row"><span className="muted">Timeline</span><input type="range" min={-5} max={5} step={1} value={timeOffset} onChange={e=>onTimeOffset(+e.target.value)} /><span className="muted">T{timeOffset>=0?'+':''}{timeOffset}d</span></div>
        <div className="row"><button className="btn" onClick={()=>setScale(s=>Math.max(.5, s/1.2))}>−</button><button className="btn" onClick={()=>{setScale(1); setOx(0); setOy(0)}}>Reset</button><button className="btn" onClick={()=>setScale(s=>Math.min(2.5, s*1.2))}>+</button></div>
      </div>
      <div className="viz">
        <canvas id="neoCanvas" ref={ref}></canvas>
        <div className="tooltip" ref={tipRef} hidden></div>
        <aside className="side" ref={panelRef} style={{display: sel? 'block':'none'}}>
          <button className="btn" onClick={()=>setSel(null)} style={{float:'right', padding:'4px 8px'}}>✕</button>
          <h4>{sel?.name||'—'}</h4>
          <div className="pgrid">
            <label>Miss</label><span>{sel? Math.round(sel.missKm).toLocaleString()+' km':'—'}</span>
            <label>Velocity</label><span>{sel? Math.round(sel.vel).toLocaleString()+' km/h':'—'}</span>
            <label>Diameter</label><span>{sel? Math.round(sel.diam)+' m':'—'}</span>
            <label>Date</label><span>{sel?.date||'—'}</span>
            <label>Hazard</label><span>{sel? (sel.hazard?'⚠️ Yes':'No'):'—'}</span>
          </div>
          {sel && <a className="btn" href={`https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${encodeURIComponent(sel.name)}`} target="_blank">Open in JPL ↗</a>}
        </aside>
      </div>
    </div>
  )
}
