import { useEffect, useState } from 'react'
import Explorer from './layouts/Explorer'
import Donki from './pages/Donki'
import TechTransfer from './pages/TechTransfer'
import useCelestialBackground from './components/backgroud'

export default function App(){
  const [tab, setTab] = useState<'explorer'|'DONKI'|'Tech Transfers'>('explorer')
  useCelestialBackground();
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


