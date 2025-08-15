// import { useEffect, useMemo, useState } from 'react';
// import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import { useQuery } from '@tanstack/react-query';
// import { fetchEonet } from '../lib/api'; // expects (URLSearchParams) => Promise<{ events: EonetEvent[] }>

// type EonetGeometry = {
//   date: string;
//   type: 'Point' | 'Polygon' | 'MultiPolygon' | string;
//   coordinates: any;
// };
// type EonetCategory = { id: number | string; title: string };
// type EonetEvent = {
//   id: string;
//   title: string;
//   description?: string;
//   link?: string;
//   closed?: string | null;
//   categories: EonetCategory[];
//   geometry: EonetGeometry[];
// };

// type Status = 'open' | 'closed' | 'all';

// /* ----------------------------- helpers ----------------------------- */

// /** Normalize a geometry to a [lat, lon] point for pin placement. */
// function toLatLon(g: EonetGeometry): [number, number] | null {
//   try {
//     if (!g) return null;

//     if (g.type === 'Point' && Array.isArray(g.coordinates)) {
//       const [lon, lat] = g.coordinates as [number, number];
//       return [lat, lon];
//     }

//     // For Polygon/MultiPolygon take first vertex (simple & fast).
//     // If you need true centroid, add a proper centroid fn later.
//     const firstPolyPoint =
//       g.type === 'Polygon'
//         ? g.coordinates?.[0]?.[0]
//         : g.type === 'MultiPolygon'
//         ? g.coordinates?.[0]?.[0]?.[0]
//         : null;

//     if (Array.isArray(firstPolyPoint)) {
//       const [lon, lat] = firstPolyPoint as [number, number];
//       return [lat, lon];
//     }

//     // Fallback: if it's just a flat [lat,lon] array (some feeds)
//     if (Array.isArray(g.coordinates) && typeof g.coordinates[0] === 'number') {
//       const [a, b] = g.coordinates as [number, number];
//       // Heuristic: a in [-90..90] is likely latitude
//       if (Math.abs(a) <= 90 && Math.abs(b) <= 180) return [a, b];
//     }
//   } catch {
//     // swallow and return null
//   }
//   return null;
// }

// function colorForCategory(title: string): string {
//   const t = (title || '').toLowerCase();
//   if (t.includes('wild')) return '#ef4444';
//   if (t.includes('storm') || t.includes('severe')) return '#60a5fa';
//   if (t.includes('volcano')) return '#f59e0b';
//   if (t.includes('flood')) return '#22c55e';
//   if (t.includes('dust') || t.includes('haze')) return '#a78bfa';
//   if (t.includes('snow') || t.includes('ice')) return '#93c5fd';
//   if (t.includes('earthquake')) return '#fb7185';
//   return '#8bd3ff';
// }

// /** Fit map view to the set of [lat, lon] points. */
// function FitToPins({ positions }: { positions: [number, number][] }) {
//   const map = useMap();
//   useEffect(() => {
//     if (!positions.length) return;
//     const Lany = (window as any).L;
//     if (Lany?.latLngBounds) {
//       const bounds = Lany.latLngBounds(positions);
//       map.fitBounds(bounds.pad(0.2));
//     } else {
//       map.setView(positions[0], 3);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [positions.length]); // length change is enough to recompute bounds
//   return null;
// }

// /* ----------------------------- UI bits ----------------------------- */

// function Controls({
//   status,
//   onStatus,
//   days,
//   onDays,
//   limit,
//   onLimit,
//   isLoading,
//   errorMessage,
// }: {
//   status: Status;
//   onStatus: (v: Status) => void;
//   days: number;
//   onDays: (n: number) => void;
//   limit: number;
//   onLimit: (n: number) => void;
//   isLoading: boolean;
//   errorMessage?: string;
// }) {
//   return (
//     <div className="actions wrap" style={{ gap: 8 }}>
//       <label className="field">
//         Status
//         <select className="select" value={status} onChange={(e) => onStatus(e.target.value as Status)}>
//           <option value="open">open</option>
//           <option value="closed">closed</option>
//           <option value="all">all</option>
//         </select>
//       </label>
//       <label className="field">
//         Days
//         <input
//           className="input"
//           type="number"
//           min={1}
//           value={days}
//           onChange={(e) => onDays(Math.max(1, Number(e.target.value || 1)))}
//         />
//       </label>
//       <label className="field">
//         Limit
//         <select className="select" value={limit} onChange={(e) => onLimit(Number(e.target.value))}>
//           {[50, 100, 200, 400, 800].map((n) => (
//             <option key={n} value={n}>
//               {n}
//             </option>
//           ))}
//         </select>
//       </label>
//       {isLoading && <span className="muted small">Loading…</span>}
//       {!!errorMessage && (
//         <span className="small" style={{ color: '#fca5a5' }}>
//           Error: {errorMessage}
//         </span>
//       )}
//     </div>
//   );
// }

// function CategoryChips({
//   selected,
//   onToggle,
// }: {
//   selected: string[];
//   onToggle: (title: string) => void;
// }) {
//   const ALL = ['Wildfires', 'Severe Storms', 'Volcanoes', 'Floods', 'Dust & Haze', 'Snow & Ice', 'Earthquakes'];
//   return (
//     <div className="chips margin-btm-12">
//       {ALL.map((title) => {
//         const active = selected.includes(title);
//         return (
//           <label
//             key={title}
//             className="chip sub"
//             style={{ borderColor: active ? 'var(--accent, #8bd3ff)' : undefined }}
//           >
//             <input type="checkbox" checked={active} onChange={() => onToggle(title)} />
//             <span
//               style={{
//                 width: 10,
//                 height: 10,
//                 borderRadius: 999,
//                 display: 'inline-block',
//                 background: colorForCategory(title),
//                 marginRight: 6,
//               }}
//             />
//             {title}
//           </label>
//         );
//       })}
//     </div>
//   );
// }

// /* ----------------------------- data hook ----------------------------- */

// /**
//  * Fetch and normalize EONET events with react-query.
//  * - Uses URLSearchParams created from component state.
//  * - Returns ready-to-use `events` array + loading/error flags.
//  */
// function useEonetEvents(status: Status, days: number, limit: number) {
//   // Memoize params so queryKey stays stable unless inputs change
//   const params = useMemo(() => {
//     const sp = new URLSearchParams();
//     sp.set('status', status);
//     sp.set('days', String(days));
//     sp.set('limit', String(limit));
//     return sp;
//   }, [status, days, limit]);

//   // Query key includes all inputs so react-query caches per combination
//   const query = useQuery({
//     queryKey: ['eonet', status, days, limit],
//     queryFn: async () => {
//       const json = await fetchEonet(params);
//       return json; // expected: { events: EonetEvent[] } or similar
//     },
//     // select is run on the successful data before it reaches the component
//     select: (data: any) => {
//       const events = Array.isArray(data) ? data : data?.events || [];
//       return events as EonetEvent[];
//     },
//     staleTime: 60_000, // 1 minute: tune as you like
//   });

//   return {
//     events: query.data ?? [],
//     isLoading: query.isLoading,
//     isError: query.isError,
//     errorMessage: query.isError ? (query.error as Error)?.message : '',
//   };
// }

// /* ----------------------------- main component ----------------------------- */

// export default function EonetMap() {
//   // UI state
//   const [status, setStatus] = useState<Status>('open');
//   const [days, setDays] = useState<number>(30);
//   const [limit, setLimit] = useState<number>(200);
//   const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

//   // Data
//   const { events, isLoading, isError, errorMessage } = useEonetEvents(status, days, limit);

//   // Filter → map → pin list
//   const pins = useMemo(() => {
//     return (events || [])
//       .filter((evt) => {
//         if (!selectedCategories.length) return true;
//         const titles = evt.categories?.map((c) => (c.title || '').toLowerCase()) ?? [];
//         return selectedCategories.some((cat) => titles.includes(cat.toLowerCase()));
//       })
//       .map((evt) => {
//         const latest = evt.geometry?.[evt.geometry.length - 1];
//         const latlon = latest ? toLatLon(latest) : null;
//         return latlon ? { evt, latlon, cat: evt.categories?.[0]?.title || 'Event' } : null;
//       })
//       .filter(Boolean) as { evt: EonetEvent; latlon: [number, number]; cat: string }[];
//   }, [events, selectedCategories]);

//   const positions: [number, number][] = useMemo(() => pins.map((p) => p.latlon), [pins]);

//   // Toggle a category chip
//   const toggleCategory = (title: string) => {
//     setSelectedCategories((prev) => (prev.includes(title) ? prev.filter((x) => x !== title) : [...prev, title]));
//   };

//   return (
//     <div className="card" style={{ overflow: 'hidden' }}>
//       <div className="card-head">
//         <div>
//           <h3 style={{ margin: 0 }}>EONET — Earth Events</h3>
//           <p className="muted sub">Fetches via react-query; hover pins to preview.</p>
//         </div>

//         <Controls
//           status={status}
//           onStatus={setStatus}
//           days={days}
//           onDays={setDays}
//           limit={limit}
//           onLimit={setLimit}
//           isLoading={isLoading}
//           errorMessage={errorMessage}
//         />
//       </div>

//       <CategoryChips selected={selectedCategories} onToggle={toggleCategory} />

//       <div style={{ height: '560px', position: 'relative' }}>
//         <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom style={{ height: '100%', width: '100%' }} worldCopyJump>
//           <TileLayer
//             url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
//             attribution="&copy; OpenStreetMap & Carto"
//           />

//           {pins.map((p, i) => (
//             <CircleMarker
//               key={`${p.evt.id}-${i}`}
//               center={p.latlon}
//               radius={6}
//               color={colorForCategory(p.cat)}
//               weight={1}
//               fillOpacity={0.85}
//             >
//               <Tooltip direction="top" offset={[0, -6]} opacity={1} permanent={false} sticky>
//                 <div style={{ fontSize: 12, maxWidth: 240 }}>
//                   <strong>{p.evt.title}</strong>
//                   <div className="muted" style={{ fontSize: 11 }}>
//                     {p.cat}
//                     {p.evt.closed ? ' · (closed)' : ''}
//                   </div>
//                   {p.evt.geometry?.length ? (
//                     <div style={{ fontSize: 11, marginTop: 4 }}>
//                       {new Date(p.evt.geometry[p.evt.geometry.length - 1].date).toLocaleString()}
//                     </div>
//                   ) : null}
//                 </div>
//               </Tooltip>
//             </CircleMarker>
//           ))}

//           {!!positions.length && <FitToPins positions={positions} />}
//         </MapContainer>
//       </div>

//       {isError && (
//         <div className="muted small" style={{ color: '#fca5a5', marginTop: 8 }}>
//           Failed to load EONET events.
//         </div>
//       )}
//     </div>
//   );
// }
