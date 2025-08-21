import { useMemo, useState } from 'react'
import Apod from '../modules/Apod'
import Mars from '../modules/Mars'
import NeoOrbit from '../modules/neoOrbit/NeoOrbit'
import Eonet from '../modules/eonet/EonetMap'

import { useObservable } from '../hooks/useObservable'
import { fetchNeoFlattened$ } from '../services/neo.service'
import { fetchEonetEvents$ } from '../services/eonet.service'
import { diffDays, formatNumbers, isoDaysAgo } from '../helpers/date.helper'
import { neoStats } from '../helpers/neo.helper'

import KpiCard from '../components/KpiCard'

export default function Explorer() {
  const [start, setStart] = useState<string>(()=> isoDaysAgo(6));
  const [end, setEnd]     = useState<string>(()=> isoDaysAgo(0));

  const neoFlat$ = useMemo(()=> fetchNeoFlattened$(start, end), [start, end]);
  const eonet$   = useMemo(()=> fetchEonetEvents$(Math.max(1, diffDays(start, end)+1), 'open', 800), [start, end]);

  const neoFlat  = useObservable<any[]>(neoFlat$, []);
  const eonet = useObservable<{ events: any[]; error?: string }>(eonet$, { events: [] });

  const daysInRange = useMemo(()=> Math.max(1, diffDays(start, end)+1), [start, end]);
  const neoAgg = useMemo(()=> neoStats(neoFlat, daysInRange), [neoFlat, daysInRange]);
  const neoErr = useMemo(()=> (neoFlat as any)?.error ? String((neoFlat as any).error) : '', [neoFlat]);
  const eonetErr = useMemo(() => eonet?.error ? String(eonet.error) : '', [eonet]);
  const eonetCount = useMemo(() => eonet?.events?.length ?? 0, [eonet]);

  return (
    <section id="pane-explorer" className="pane active slide-in" role="tabpanel" aria-labelledby="Explorer">
      <div className="card">
        <div className="row between">
          <div>
            <h3 style={{ margin: 0 }}>Key Metrics</h3>
            <p className="sub">Quick pulse of near‑Earth objects and Earth events. Use the date filter to recalculate</p>
          </div>
          <div className="actions wrap">
            <label className="sub">Start<br/><input className="input" type="date" value={start} onChange={e=>setStart(e.target.value)} /></label>
            <label className="sub">End<br/><input className="input" type="date" value={end} onChange={e=>setEnd(e.target.value)} /></label>
          </div>
        </div>
        <div className="kpi-grid" style={{marginTop:16}}>
          <KpiCard title="NEOs in date range" value={formatNumbers(neoAgg.count)} error={neoErr} icon="☄️"/>
          <KpiCard title="Avg NEOs per day" value={neoAgg.avgPerDay.toFixed(1)} />
          <KpiCard title="Avg miss distance" sub="kilometers" value={formatNumbers(Math.round(neoAgg.avgMissKm))} />
          <KpiCard title="Avg velocity" sub="km/h" value={formatNumbers(Math.round(neoAgg.avgVel))} />
          <KpiCard title="Earth events (EONET)" value={formatNumbers(eonetCount)} error={eonetErr} icon="🪐"/>
        </div>
      </div>

      <div className="grid grid-2 mt-16">
        <Apod/>
        <Mars/>
        <NeoOrbit/>
        <Eonet/>
      </div>
    </section>
  )
}
