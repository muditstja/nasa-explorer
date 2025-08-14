import { useEffect, useState } from 'react'
import Explorer from './components/Explorer'
import Donki from './features/Donki'
import TechTransfer from './features/TechTransfer'

export default function App(){
  const [tab, setTab] = useState<'explorer'|'DONKI'|'Tech Transfers'>('explorer')
  useCelestialBackground()
  return (
    <div className="container space-y">
      <header className="header">
        <h1 className="logo">🚀 NASA Explorer</h1>
        <nav className="tabs" role="tablist">
          {(['explorer','DONKI','Tech Transfers'] as const).map(t=> (
            <button key={t} className={`tab ${tab===t?'active':''}`} onClick={()=>setTab(t)} role="tab">
              {t[0].toUpperCase()+t.slice(1)}
            </button>
          ))}
        </nav>
      </header>

      {tab==='explorer' && <Explorer/>}
      {tab==='DONKI' && <Donki/>}
      {tab==='Tech Transfers' && <TechTransfer/>}

      <footer className="footer muted">
        Bounce Insight assignment!
      </footer>
    </div>
  )
}

/** Celestial animated background (parallax stars + nebulas + shooting stars) */
function useCelestialBackground(){
  useEffect(()=>{
    const bg = document.getElementById('bg') as HTMLCanvasElement
    if (!bg) return
    const ctx = bg.getContext('2d', { alpha: true })!
    let stars: any[] = [], nebulas: any[] = [], shooters: any[] = []
    let mx=0,my=0, raf=0

    const resize = ()=>{ bg.width = innerWidth; bg.height = innerHeight; init() }
    const init = ()=>{
      const count = Math.min(700, Math.floor((bg.width*bg.height)/2500))
      stars = Array.from({length: count}).map(()=> ({
        x: Math.random()*bg.width, y: Math.random()*bg.height, z: Math.random()*1+0.2, r: Math.random()*1.25+0.2, tw: Math.random()*0.02+0.005, t0: Math.random()*Math.PI*2
      }))
      nebulas = Array.from({length: 4}).map(()=> ({ x: Math.random()*bg.width, y: Math.random()*bg.height, r: Math.random()*520+300, hue: Math.random()*360, parallax: Math.random()*0.4+0.1 }))
    }
    const spawnShooter = ()=>{
      const side = Math.random()<.5?'left':'top'
      const x = side==='left'?-50:Math.random()*bg.width
      const y = side==='top'?-50:Math.random()*bg.height
      const vx = side==='left'?(2+Math.random()*2):(Math.random()*2-1)
      const vy = side==='top'?(2+Math.random()*2):(Math.random()*2-1)
      shooters.push({x,y,vx,vy,life:1.2})
      setTimeout(spawnShooter, 12000 + Math.random()*12000)
    }
    const draw = (time: number)=>{
      const w=bg.width,h=bg.height
      ctx.clearRect(0,0,w,h)
      const parX = (mx/w - .5), parY = (my/h - .5)
      nebulas.forEach((n,i)=>{
        const dx = parX*40*n.parallax + Math.sin(time*.00005+i)*20
        const dy = parY*40*n.parallax + Math.cos(time*.00004+i)*15
        const g = ctx.createRadialGradient(n.x+dx, n.y+dy, 0, n.x+dx, n.y+dy, n.r)
        g.addColorStop(0, `hsla(${(n.hue+20)%360},80%,65%,.08)`)
        g.addColorStop(1, 'transparent')
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(n.x+dx, n.y+dy, n.r, 0, Math.PI*2); ctx.fill()
      })
      stars.forEach(s=>{
        const a = .6 + .4*Math.sin(time*s.tw + s.t0)
        ctx.globalAlpha=a; ctx.fillStyle='#cfe8ff'; ctx.beginPath(); ctx.arc(s.x+parX*30*s.z, s.y+parY*30*s.z, s.r*s.z, 0, Math.PI*2); ctx.fill()
      })
      ctx.globalAlpha=1
      shooters = shooters.filter(s => (s.life -= .01) > 0)
      shooters.forEach(s=>{ s.x+=s.vx*3; s.y+=s.vy*3; ctx.strokeStyle=`rgba(255,255,255,${Math.max(0,s.life)})`; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(s.x-s.vx*20, s.y-s.vy*20); ctx.stroke() })
      raf = requestAnimationFrame(draw)
    }
    addEventListener('resize', resize)
    addEventListener('mousemove', e=>{ mx=e.clientX; my=e.clientY })
    resize(); spawnShooter(); raf = requestAnimationFrame(draw)
    return ()=>{ cancelAnimationFrame(raf); removeEventListener('resize', resize) }
  },[])
}
