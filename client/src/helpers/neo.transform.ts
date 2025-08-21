import { DrawableNeo, NasaNeoObject } from "../interfaces/nasaExplorer.interface";


/** Convert API objects into compact, drawable items with derived fields. */
export function toDrawableNEOs(rows: NasaNeoObject[]): DrawableNeo[] {
  return rows.map((o, i) => {
    const ca = o.close_approach_data?.[0] || {};
    const missKm = +(ca.miss_distance?.kilometers || 0);
    const velKmh = +(ca.relative_velocity?.kilometers_per_hour || 0);

    const dmin = o.estimated_diameter?.meters?.estimated_diameter_min || 0;
    const dmax = o.estimated_diameter?.meters?.estimated_diameter_max || 0;
    const diamM = (dmin + dmax) / 2;

    const date = ca.close_approach_date_full || ca.close_approach_date || '';
    const hazard = !!o.is_potentially_hazardous_asteroid;

    // Visual-only parameters to make the layout readable.
    const ecc = Math.min(0.6, velKmh / 120_000); // clamp a bit
    const period = 8 + (i % 20);                 // mild spread
    const angle0 = ((i * 137.5) % 360) * (Math.PI / 180);

    return { id: o.id, name: o.name, missKm, velKmh, diamM, date, hazard, ecc, period, angle0 };
  })
  .filter(o => o.missKm > 0 && o.velKmh > 0 && o.diamM > 0);
}
