import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchNEO } from '../../services/api.service';
import { NasaNeoObject } from '../../interfaces/nasaExplorer.interface';
import { toDrawableNEOs } from '../../helpers/neo.transform';
import NeoControls from './neoControl';
import NeoCanvas from './neoCanvas';

const iso = (d = new Date()) => d.toISOString().slice(0, 10);
const addDays = (base: Date, n: number) => new Date(base.getTime() + n * 86_400_000);

export default function NeoOrbit() {
  const [start, setStart] = useState(() => iso(addDays(new Date(), -2)));
  const [end, setEnd] = useState(() => iso(addDays(new Date(), +2)));
  const [hazardousOnly, setHazardousOnly] = useState(false);
  const [animate, setAnimate] = useState(true);
  const [timeOffset, setTimeOffset] = useState(0);

  const q = useQuery({
    queryKey: ['neo', start, end],
    queryFn: async () => (await fetchNEO(start, end)),
  });

  const items = useMemo(() => {
    const rows = (q.data?.objects || []) as NasaNeoObject[];
    return toDrawableNEOs(rows);
  }, [q.data]);

  return (
    <section className="card">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0 }}>Near-Earth Objects</h3>
          <p className="muted sub">Earth-centric orbits. Hover for details; click for side panel.</p>
        </div>
        <NeoControls
          start={start}
          end={end}
          hazardousOnly={hazardousOnly}
          animate={animate}
          onStart={setStart}
          onEnd={setEnd}
          onHazardousOnly={setHazardousOnly}
          onAnimate={setAnimate}
          // onZoomIn={() => setTimeOffset(t => t + 0)}   // left for symmetry; timeOffset is separate control if needed
          // onZoomOut={() => setTimeOffset(t => t + 0)}
          // onResetView={() => setTimeOffset(0)}
        />
      </div>

      <NeoCanvas
        items={items}
        hazardousOnly={hazardousOnly}
        animate={animate}
        timeOffset={timeOffset}
        onTimeOffset={setTimeOffset}
      />

      {q.isLoading && <div className="skeleton" style={{ height: 10, marginTop: 8 }} />}
      {q.isError && <div className="muted">Failed to load NEO feed.</div>}
    </section>
  );
}
