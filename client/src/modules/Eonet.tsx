import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type EonetGeometry = {
  date: string;
  type: 'Point' | 'Polygon' | 'MultiPolygon' | string;
  coordinates: any;
};
type EonetCategory = { id: number | string; title: string };
type EonetEvent = {
  id: string;
  title: string;
  description?: string;
  link?: string;
  closed?: string | null;
  categories: EonetCategory[];
  geometry: EonetGeometry[];
};

type Status = 'open' | 'closed' | 'all';

function normalizeCoord(g: EonetGeometry): [number, number] | null {
  try {
    if (g.type === 'Point') {
      const [lon, lat] = g.coordinates as [number, number];
      return [lat, lon];
    }
    if (g.type === 'Polygon' && Array.isArray(g.coordinates)) {
      const first = g.coordinates?.[0]?.[0];
      if (Array.isArray(first)) {
        const [lon, lat] = first as [number, number];
        return [lat, lon];
      }
    }
    if (g.type === 'MultiPolygon' && Array.isArray(g.coordinates)) {
      const first = g.coordinates?.[0]?.[0]?.[0];
      if (Array.isArray(first)) {
        const [lon, lat] = first as [number, number];
        return [lat, lon];
      }
    }
    if (Array.isArray(g.coordinates) && typeof g.coordinates[0] === 'number') {
      const [a, b] = g.coordinates as [number, number];
      if (Math.abs(a) <= 90 && Math.abs(b) <= 180) return [a, b];
    }
  } catch {}
  return null;
}

function categoryColor(title: string): string {
  const t = (title || '').toLowerCase();
  if (t.includes('wild')) return '#ef4444';
  if (t.includes('storm') || t.includes('severe')) return '#60a5fa';
  if (t.includes('volcano')) return '#f59e0b';
  if (t.includes('flood')) return '#22c55e';
  if (t.includes('dust') || t.includes('haze')) return '#a78bfa';
  if (t.includes('snow') || t.includes('ice')) return '#93c5fd';
  if (t.includes('earthquake')) return '#fb7185';
  return '#8bd3ff';
}

function FitToEvents({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const Lany = (window as any).L;
    if (Lany?.latLngBounds) {
      const bounds = Lany.latLngBounds(points);
      map.fitBounds(bounds.pad(0.2));
    } else {
      map.setView(points[0], 3);
    }
  }, [points.length]);
  return null;
}

export default function EonetMapSelfContained() {
  const [status, setStatus] = useState<Status>('open');
  const [days, setDays] = useState<number>(30);
  const [limit, setLimit] = useState<number>(200);
  const [includeCats, setIncludeCats] = useState<string[]>([]);
  const [data, setData] = useState<EonetEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const controller = new AbortController();
    const url = new URL('https://eonet.gsfc.nasa.gov/api/v3/events');
    url.searchParams.set('status', status);
    url.searchParams.set('days', String(days));
    url.searchParams.set('limit', String(limit));
    setLoading(true);
    setError('');
    fetch(url.toString(), { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        const events = Array.isArray(json) ? json : json.events || [];
        setData(events);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message || 'Failed to fetch EONET');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [status, days, limit]);

  const points = useMemo(() => {
    return (data || [])
      .filter((ev) => {
        if (!includeCats.length) return true;
        const titles = ev.categories?.map((c) => (c.title || '').toLowerCase()) ?? [];
        return includeCats.some((c) => titles.includes(c.toLowerCase()));
      })
      .map((ev) => {
        const g = ev.geometry?.[ev.geometry.length - 1];
        const ll = g ? normalizeCoord(g) : null;
        return ll ? { ev, latlng: ll, cat: ev.categories?.[0]?.title || 'Event' } : null;
      })
      .filter(Boolean) as { ev: EonetEvent; latlng: [number, number]; cat: string }[];
  }, [data, JSON.stringify(includeCats)]);

  const positions = useMemo(() => points.map((p) => p.latlng), [points]);

  const toggleCat = (c: string) => {
    setIncludeCats((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="card-head">
        <div>
          <h3 style={{ margin: 0 }}>EONET — Earth Events</h3>
          <p className="muted sub">Self‑contained: fetches EONET directly. Hover pins to preview.</p>
        </div>
        <div className="actions wrap" style={{ gap: 8 }}>
          <label className="field">Status
            <select className="select" value={status} onChange={(e)=>setStatus(e.target.value as Status)}>
              <option value="open">open</option>
              <option value="closed">closed</option>
              <option value="all">all</option>
            </select>
          </label>
          <label className="field">Days
            <input className="input" type="number" min={1} value={days} onChange={(e)=>setDays(Math.max(1, Number(e.target.value||1)))} />
          </label>
          <label className="field">Limit
            <select className="select" value={limit} onChange={(e)=>setLimit(Number(e.target.value))}>
              {[50,100,200,400,800].map(n=> <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          {loading && <span className="muted small">Loading…</span>}
          {error && <span style={{ color: '#fca5a5' }} className="small">Error: {error}</span>}
        </div>
      </div>

      <div className="chips margin-btm-12">
        {['Wildfires','Severe Storms','Volcanoes','Floods','Dust & Haze','Snow & Ice','Earthquakes'].map((k)=> (
          <label key={k} className="chip sub" style={{ borderColor: includeCats.includes(k) ? 'var(--accent, #8bd3ff)' : undefined }}>
            <input type="checkbox" checked={includeCats.includes(k)} onChange={()=>toggleCat(k)} />
            <span style={{ width: 10, height: 10, borderRadius: 999, display: 'inline-block', background: categoryColor(k), marginRight: 6 }} />
            {k}
          </label>
        ))}
      </div>

      <div style={{ height: '560px', position: 'relative' }}>
        <MapContainer
          center={[20, 0]}
          zoom={2}
          scrollWheelZoom
          style={{ height: '100%', width: '100%' }}
          worldCopyJump
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; Carto'
          />
          {points.map((p, idx) => (
            <CircleMarker
              key={p.ev.id + '-' + idx}
              center={p.latlng}
              radius={6}
              color={categoryColor(p.cat)}
              weight={1}
              fillOpacity={0.85}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={1} permanent={false} sticky>
                <div style={{ fontSize: 12, maxWidth: 240 }}>
                  <strong>{p.ev.title}</strong>
                  <div className="muted" style={{ fontSize: 11 }}>
                    {p.cat}{p.ev.closed ? ' · (closed)' : ''}
                  </div>
                  {p.ev.geometry?.length ? (
                    <div style={{ fontSize: 11, marginTop: 4 }}>
                      {new Date(p.ev.geometry[p.ev.geometry.length - 1].date).toLocaleString()}
                    </div>
                  ) : null}
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
          {!!positions.length && <FitToEvents points={positions} />}
        </MapContainer>
      </div>
    </div>
  );
}
