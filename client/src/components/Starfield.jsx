import React, { useEffect, useRef } from 'react'

export default function Starfield({ density = 0.0012 }) {
  const ref = useRef(null)
  const raf = useRef(0)
  const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d', { alpha: true })
    let w, h, dpr, stars = [], mouse = { x: 0, y: 0 }, last = 0, visible = true

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth; h = canvas.clientHeight
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      spawn()
    }

    function spawn() {
      const count = Math.floor(w * h * density / 2)
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: 0.2 + Math.random() * 0.8,
        r: 0.5 + Math.random() * 1.8
      }))
    }

    function draw(t) {
      if (!visible) return
      const dt = Math.min(32, t - last); last = t
      ctx.clearRect(0, 0, w, h)

      // Parallax center follows mouse slightly
      const cx = w / 2 + (mouse.x - w / 2) * 0.04
      const cy = h / 2 + (mouse.y - h / 2) * 0.04

      // Stars
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]
        const dx = (s.x - cx) * s.z * 0.002
        const dy = (s.y - cy) * s.z * 0.002
        s.x += dx * dt; s.y += dy * dt
        if (s.x < -50 || s.x > w + 50 || s.y < -50 || s.y > h + 50) {
          s.x = Math.random() * w; s.y = Math.random() * h
        }
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r * s.z, 0, Math.PI * 2)
        ctx.fill()
      }

      // Constellation lines near cursor
      const radius = 140
      ctx.strokeStyle = 'rgba(125,211,252,0.18)'
      ctx.lineWidth = 1
      for (let i = 0; i < stars.length; i++) {
        const a = stars[i]
        const dx = a.x - mouse.x, dy = a.y - mouse.y
        if (dx*dx + dy*dy < radius*radius) {
          for (let j = i + 1; j < i + 6 && j < stars.length; j++) {
            const b = stars[j]
            const d2 = (a.x - b.x)**2 + (a.y - b.y)**2
            if (d2 < 2500) {
              ctx.globalAlpha = 1 - d2 / 2500
              ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
              ctx.globalAlpha = 1
            }
          }
        }
      }

      raf.current = requestAnimationFrame(draw)
    }

    function onMouse(e) {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top
    }
    function onVisibility() { visible = !document.hidden }
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouse, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    resize()
    if (!reduce) raf.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [density])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="fixed inset-0 -z-10 w-full h-full"
    />
  )
}