
export type EonetGeometry = {
  date: string;
  type: 'Point' | 'Polygon' | 'MultiPolygon' | string;
  coordinates: any;
};

export type EonetCategory = { id: number | string; title: string };

export type EonetEvent = {
  id: string;
  title: string;
  description?: string;
  link?: string;
  closed?: string | null;
  categories: EonetCategory[];
  geometry: EonetGeometry[];
};

/** Safely normalize a geometry to [lat, lon] for map pins. */
export function toLatLon(geom?: EonetGeometry): [number, number] | null {
  if (!geom) return null;
  try {
    if (geom.type === 'Point' && Array.isArray(geom.coordinates)) {
      const [lon, lat] = geom.coordinates as [number, number];
      return [lat, lon];
    }
    // For Polygon/MultiPolygon, use the first vertex (fast). For true centroid add later.
    const first =
      geom.type === 'Polygon'
        ? geom.coordinates?.[0]?.[0]
        : geom.type === 'MultiPolygon'
        ? geom.coordinates?.[0]?.[0]?.[0]
        : null;

    if (Array.isArray(first)) {
      const [lon, lat] = first as [number, number];
      return [lat, lon];
    }

    // Fallback for [lat, lon]
    if (Array.isArray(geom.coordinates) && typeof geom.coordinates[0] === 'number') {
      const [a, b] = geom.coordinates as [number, number];
      if (Math.abs(a) <= 90 && Math.abs(b) <= 180) return [a, b];
    }
  } catch {
    // ignore bad geometry
  }
  return null;
}

/** Category → color mapping */
export function colorForCategory(title: string): string {
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

export const DEFAULT_CATEGORY_FILTERS = [
  'Wildfires',
  'Severe Storms',
  'Volcanoes',
  'Floods',
  'Dust & Haze',
  'Snow & Ice',
  'Earthquakes',
];
