import { openInJPL } from '../../helpers/neo.helper';
import { useCanvasSize } from '../../helpers/useCanvasSize';
import { DrawableNeo, Props } from '../../interfaces/nasaExplorer.interface';
import { useEffect, useRef, useState } from 'react';


export default function NeoCanvas({ items, hazardousOnly, animate, timeOffset }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const [selected, setSelected] = useState<DrawableNeo | null>(null);
  const { w, h } = useCanvasSize(canvasRef.current);

  // pan/zoom state
  const [scale, setScale] = useState(1);
  const [ox, setOx] = useState(0);
  const [oy, setOy] = useState(0);

  // reset view when dataset changes significantly
  useEffect(() => { setScale(1); setOx(0); setOy(0); }, [items.length]);

  /** Scene rendering + interaction wiring */
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf = 0, dragging = false, lx = 0, ly = 0;

    const worldToScreen = (x: number, y: number) => ({ x: (w / 2 + ox) + x * scale, y: (h / 2 + oy) + y * scale });

    function draw(time: number) {
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(w / 2 + ox, h / 2 + oy);
      ctx.scale(scale, scale);

      // Earth + glow
      const earthR = 26;
      const glow = ctx.createRadialGradient(0, 0, earthR * .5, 0, 0, earthR * 3);
      glow.addColorStop(0, 'rgba(102,197,255,.45)');
      glow.addColorStop(1, 'rgba(102,197,255,0)');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, earthR * 3, 0, Math.PI * 2); ctx.fill();

      const sunAng = time * .00003;
      const grad = ctx.createLinearGradient(Math.cos(sunAng) * earthR, Math.sin(sunAng) * earthR, -Math.cos(sunAng) * earthR, -Math.sin(sunAng) * earthR);
      grad.addColorStop(0, '#3cc3ff'); grad.addColorStop(1, '#0a1a2a');
      ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(0, 0, earthR, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#a6e1ff88'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, earthR, 0, Math.PI * 2); ctx.stroke();

      // Orbit dots
      const pxPerKm = 1 / 4000;
      const base = earthR + 12;
      const list = (hazardousOnly ? items.filter((o: any) => o.hazard) : items).slice(0, 120);

      list.forEach((o: any, i: any) => {
        const a0 = o.angle0;
        const angle = a0 + (animate ? time * .0003 / o.period : 0) + timeOffset * .15;

        const a = Math.min((o.missKm * pxPerKm) + base, Math.min(w, h) / 2 - 20);
        const b = a * (1 - o.ecc * 0.6);
        const phi = (i / list.length) * Math.PI; // gentle spread

        const x = a * Math.cos(angle), y = b * Math.sin(angle);
        const xr = x * Math.cos(phi) - y * Math.sin(phi);
        const yr = x * Math.sin(phi) + y * Math.cos(phi);

        const r = Math.max(2, Math.min(6, o.diamM / 100));
        ctx.fillStyle = o.hazard ? '#ff7b72' : '#cfe8ff';
        ctx.beginPath(); ctx.arc(xr, yr, r, 0, Math.PI * 2); ctx.fill();

        const sp = worldToScreen(xr, yr);
        o.__x = sp.x; o.__y = sp.y; o.__r = r * scale;
      });

      ctx.restore();
      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    function onDown(e: PointerEvent) { dragging = true; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); }
    function onUp(e: PointerEvent) { dragging = false; canvas.releasePointerCapture(e.pointerId); }
    function onMove(e: PointerEvent) {
      if (dragging) { setOx(v => v + (e.clientX - lx)); setOy(v => v + (e.clientY - ly)); lx = e.clientX; ly = e.clientY; }
    }
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const f = e.deltaY > 0 ? 1 / 1.1 : 1.1;
      setScale(s => Math.min(2.5, Math.max(.5, s * f)));
    }

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [canvasRef.current, w, h, ox, oy, scale, animate, timeOffset, items, hazardousOnly]);

  /** Hover and selection tooltip/panel */
  useEffect(() => {
    const canvas = canvasRef.current!, tip = tipRef.current!;
    function hit(mx: number, my: number): DrawableNeo | null {
      let best: DrawableNeo | null = null, min = 12;
      for (const o of (hazardousOnly ? items.filter((x: any) => x.hazard) : items)) {
        const dx = mx - (o.__x || 0), dy = my - (o.__y || 0);
        const d = Math.hypot(dx, dy);
        if (d < Math.max(8, (o.__r || 0) + 6) && d < min) { min = d; best = o; }
      }
      return best;
    }
    function mm(e: MouseEvent) {
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      const o = hit(mx, my);
      if (o) {
        tip.hidden = false; tip.style.left = `${o.__x}px`; tip.style.top = `${o.__y}px`;
        tip.innerHTML =
          `<strong>${o.name}</strong><br/>` +
          `Miss: ${Math.round(o.missKm).toLocaleString()} km<br/>` +
          `Speed: ${Math.round(o.velKmh).toLocaleString()} km/h<br/>` +
          `Diam: ${Math.round(o.diamM)} m<br/>` +
          `Date: ${o.date}`;
      } else { tip.hidden = true; }
    }
    function click(e: MouseEvent) {
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      const o = hit(mx, my);
      if (o) setSelected(o);
    }
    canvas.addEventListener('mousemove', mm);
    canvas.addEventListener('mouseleave', () => { tip.hidden = true; });
    canvas.addEventListener('click', click);
    return () => {
      canvas.removeEventListener('mousemove', mm);
      canvas.removeEventListener('mouseleave', () => { tip.hidden = true; });
      canvas.removeEventListener('click', click);
    };
  }, [items, hazardousOnly]);

  return (
    <div className="viz">
      <canvas id="neoCanvas" ref={canvasRef} />
      <div className="tooltip" ref={tipRef} hidden></div>

      <aside className="side" ref={panelRef} style={{ display: selected ? 'block' : 'none' }}>
        <button className="btn" onClick={() => setSelected(null)} style={{ float: 'right', padding: '4px 8px' }}>✕</button>
        <h4>{selected?.name || '—'}</h4>
        <div className="pgrid">
          <label>Miss</label><span>{selected ? Math.round(selected.missKm).toLocaleString() + ' km' : '—'}</span>
          <label>Velocity</label><span>{selected ? Math.round(selected.velKmh).toLocaleString() + ' km/h' : '—'}</span>
          <label>Diameter</label><span>{selected ? Math.round(selected.diamM) + ' m' : '—'}</span>
          <label>Date</label><span>{selected?.date || '—'}</span>
          <label>Hazard</label><span>{selected ? (selected.hazard ? '⚠️ Yes' : 'No') : '—'}</span>
        </div>
        {selected && (
          <a className="btn"
             onClick={() => openInJPL(selected.name)}
             target="_blank" rel="noreferrer">Open in JPL ↗</a>
        )}
      </aside>
    </div>
  );
}
