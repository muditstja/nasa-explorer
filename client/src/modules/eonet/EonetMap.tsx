import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { useEonetEvents } from '../../hooks/useEonetEvents';
import { toLatLon, colorForCategory, EonetEvent } from '../../helpers/eonet';
import Controls from './Controls';
import CategoryChips from './CategoryChips';
import FitToPins from './FitToPins';

import '../../styles/eonet.css'; // small extras (tooltip z-index, skeleton, etc.)

type Status = 'open' | 'closed' | 'all';

export default function EonetMap() {
  // Controls state (drives the query)
  const [status, setStatus] = useState<Status>('open');
  const [days, setDays] = useState<number>(30);
  const [limit, setLimit] = useState<number>(200);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Data fetch via React Query (calls your backend)
  const { events, isLoading, isError, error } = useEonetEvents(days, status, limit);

  // Derive pin list from events (+ filters)
  const pins = useMemo(() => {
    return (events as EonetEvent[])
      .filter((evt) => {
        if (!selectedCategories.length) return true;
        const titles = evt.categories?.map((c) => (c.title || '').toLowerCase()) ?? [];
        return selectedCategories.some((cat) => titles.includes(cat.toLowerCase()));
      })
      .map((evt) => {
        const latest = evt.geometry?.[evt.geometry.length - 1];
        const latlon = toLatLon(latest);
        return latlon ? { evt, latlon, cat: evt.categories?.[0]?.title || 'Event' } : null;
      })
      .filter(Boolean) as { evt: EonetEvent; latlon: [number, number]; cat: string }[];
  }, [events, selectedCategories]);

  const positions: [number, number][] = useMemo(() => pins.map((p) => p.latlon), [pins]);

  function toggleCategory(title: string) {
    setSelectedCategories((prev) =>
      prev.includes(title) ? prev.filter((x) => x !== title) : [...prev, title]
    );
  }

  return (
    <div className="card eonet-card">
      <div className="card-head">
        <div>
          <h3 style={{ margin: 0 }}>EONET — Earth Events</h3>
          <p className="muted sub">Powered by React Query. Hover pins to preview.</p>
        </div>

        <Controls
          status={status}
          onStatus={setStatus}
          days={days}
          onDays={setDays}
          limit={limit}
          onLimit={setLimit}
          isLoading={isLoading}
          errorMessage={isError ? error?.message : undefined}
        />
      </div>

      <CategoryChips selected={selectedCategories} onToggle={toggleCategory} />

      <div className="eonet-map-wrap">
        {isLoading && <div className="skeleton eonet-skeleton" aria-hidden="true" />}

        <MapContainer
          center={[20, 0]}
          zoom={2}
          scrollWheelZoom
          worldCopyJump
          className="eonet-map"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; OpenStreetMap & Carto"
          />

          {pins.map((p, i) => (
            <CircleMarker
              key={`${p.evt.id}-${i}`}
              center={p.latlon}
              radius={6}
              color={colorForCategory(p.cat)}
              weight={1}
              fillOpacity={0.85}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={1} sticky>
                <div style={{ fontSize: 12, maxWidth: 240 }}>
                  <strong>{p.evt.title}</strong>
                  <div className="muted" style={{ fontSize: 11 }}>
                    {p.cat}
                    {p.evt.closed ? ' · (closed)' : ''}
                  </div>
                  {p.evt.geometry?.length ? (
                    <div style={{ fontSize: 11, marginTop: 4 }}>
                      {new Date(
                        p.evt.geometry[p.evt.geometry.length - 1].date
                      ).toLocaleString()}
                    </div>
                  ) : null}
                </div>
              </Tooltip>
            </CircleMarker>
          ))}

          {!!positions.length && <FitToPins positions={positions} />}
        </MapContainer>
      </div>

      {isError && (
        <div className="muted small" style={{ color: '#fca5a5', marginTop: 8 }}>
          Failed to load EONET events.
        </div>
      )}
    </div>
  );
}
