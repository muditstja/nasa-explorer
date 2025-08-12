import React, { useState } from 'react'
import Starfield from './components/Starfield.jsx'
import AnimatedHero from './components/AnimatedHero.jsx'

export default function App() {
  const [tab, setTab] = useState('apod')

  return (
    <>
      <Starfield />
      <header className="pt-6">
        <AnimatedHero onPick={setTab} />
        <TabBar value={tab} onChange={setTab} />
      </header>

      <main className="pb-24">
       
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-12 text-center text-white/40">
        Built for fun • Playful Explorer theme • v1
      </footer>
    </>
  )
}
