import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

const orbit = {
  initial: { rotate: 0 },
  animate: { rotate: 360, transition: { repeat: Infinity, ease: 'linear', duration: 36 } }
}

export function Orbiting({ delay = 0, radius = 140, children }) {
  return (
    <motion.div
      className="absolute inset-0"
      variants={orbit}
      initial="initial"
      animate="animate"
      style={{ filter: 'drop-shadow(0 0 12px rgba(125,211,252,0.25))' }}
    >
      <div
        className="absolute"
        style={{
          left: `calc(50% + ${radius}px)`,
          top: '50%',
          transform: `translate(-50%, -50%) rotate(${delay * 90}deg)`
        }}
      >
        {children}
      </div>
    </motion.div>
  )
}

export default function AnimatedHero({ onPick }) {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pt-14 pb-10 text-center">
      <motion.h1
        className="text-5xl md:text-6xl font-bold tracking-tight text-white"
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      >
        NASA <span className="text-sky-300">Explorer</span>
      </motion.h1>
      <motion.p
        className="mt-4 text-lg text-white/70 max-w-2xl mx-auto"
        initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}
      >
        Tap a planet, pull data, play with the cosmos.
      </motion.p>

      <div className="relative mt-10 mx-auto w-[420px] h-[420px] card tilt">
        <motion.div
          className="absolute inset-0 rounded-2xl"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ background: 'radial-gradient(70% 70% at 50% 40%, rgba(56,189,248,0.08), transparent)' }}
        />
        {/* Central planet */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 tilt-child"
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 140, damping: 14 }}
        >
          <Planet />
        </motion.div>

        {/* Orbiting cards */}
        <Orbiting radius={150} delay={0}>
          <MenuCard label="APOD" onClick={() => onPick('apod')} />
        </Orbiting>
        <Orbiting radius={150} delay={1}>
          <MenuCard label="NEOs" onClick={() => onPick('neo')} />
        </Orbiting>
        <Orbiting radius={150} delay={2}>
          <MenuCard label="Mars" onClick={() => onPick('mars')} />
        </Orbiting>
        <Orbiting radius={150} delay={3}>
          <MenuCard label="Media" onClick={() => onPick('media')} />
        </Orbiting>
      </div>
      <p className="mt-6 text-xs text-white/40">Build {__BUILD_TIME__}</p>
    </section>
  )
}

function MenuCard({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'card px-4 py-2 text-sm font-medium hover:scale-105 transition-transform',
        'focus:outline-none focus:ring-2 focus:ring-sky-400/50'
      )}
      aria-label={`Open ${label}`}
    >
      {label}
    </button>
  )
}

function Planet() {
  return (
    <div className="relative w-40 h-40">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <radialGradient id="g" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#7dd3fc" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.4" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="70" fill="url(#g)"></circle>
        <motion.ellipse
          cx="100" cy="100" rx="100" ry="28"
          fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2"
          initial={{ rotate: -10 }} animate={{ rotate: 10 }} transition={{ repeat: Infinity, repeatType: 'mirror', duration: 6 }}
        />
      </svg>
    </div>
  )
}