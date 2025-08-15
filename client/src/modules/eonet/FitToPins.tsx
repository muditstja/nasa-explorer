import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/**
 * Fits Leaflet map to the provided positions.
 * Depends only on positions.length to avoid heavy recomputes.
 */
export default function FitToPins({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (!positions.length) return;
    const Lany = (window as any).L;
    if (Lany?.latLngBounds) {
      const bounds = Lany.latLngBounds(positions);
      map.fitBounds(bounds.pad(0.2));
    } else {
      map.setView(positions[0], 3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions.length]);

  return null;
}
