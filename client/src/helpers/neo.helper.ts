export type NEO = any;

export function flattenNeoFeed(feed: any) {
  const grouped = feed?.near_earth_objects ?? {};
  return Object.values(grouped).flat() as NEO[];
}

export function neoStats(objects: NEO[], days: number) {
  if (!objects.length) return { count: 0, avgPerDay: 0, avgMissKm: 0, avgVel: 0 };

  let totalMiss = 0, totalVelocity = 0, totalObjects = 0;
  const count = objects.length;

  for (const Object of objects) {
    const closeApproach = Object?.close_approach_data?.[0];
    const missDistance = +closeApproach?.miss_distance?.kilometers || 0;
    const velocityRelative = +closeApproach?.relative_velocity?.kilometers_per_hour || 0;
    if (missDistance > 0 && velocityRelative > 0) {
      totalMiss += missDistance;
      totalVelocity += velocityRelative;
      totalObjects++;
    }
  }

  return {
    count,
    avgPerDay: count / Math.max(1, days),
    avgMissKm: totalObjects ? totalMiss / totalObjects : 0,
    avgVel: totalObjects ? totalVelocity / totalObjects : 0,
  };
}

export function openInJPL(name: string) {
  const url = `https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${encodeURIComponent(name)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
