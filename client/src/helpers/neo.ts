export type NEO = any;
export function flattenNeoFeed(feed: any) {
  const grouped = feed?.near_earth_objects ?? {};
  return Object.values(grouped).flat() as NEO[];
}
export function neoStats(objs: NEO[], days: number) {
    console.log("NEO = ", objs);
  if (!objs.length) return { count: 0, avgPerDay: 0, avgMissKm: 0, avgVel: 0 };
  let miss = 0,
    vel = 0,
    n = 0;
  for (const o of objs) {
    const ca = o?.close_approach_data?.[0];
    const m = +ca?.miss_distance?.kilometers || 0;
    const v = +ca?.relative_velocity?.kilometers_per_hour || 0;
    if (m > 0 && v > 0) {
      miss += m;
      vel += v;
      n++;
    }
  }
  const count = objs.length;
  return {
    count,
    avgPerDay: count / Math.max(1, days),
    avgMissKm: n ? miss / n : 0,
    avgVel: n ? vel / n : 0,
  };
}
