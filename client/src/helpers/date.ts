export function getTodayAndSevenDaysAgo() {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const formatDate = (date: Date) =>
    date.toISOString().split("T")[0]; // "YYYY-MM-DD"

  return {
    today: formatDate(today),
    sevenDaysAgo: formatDate(sevenDaysAgo)
  };
}

export function isoDaysAgo(n: number) {
  const d = new Date(Date.now() - n * 86400000);
  return d.toISOString().slice(0, 10);
}

export function diffDays(a: string, b: string) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
}

export function enumerateDays(startDate: string, endDate: string) {
  const out: string[] = [];
  let t = Date.parse(startDate),
    stop = Date.parse(endDate);
  if (isNaN(t) || isNaN(stop)) return out;
  if (t > stop) [t, stop] = [stop, t];
  for (let x = t; x <= stop; x += 86400000)
    out.push(new Date(x).toISOString().slice(0, 10));
  return out;
}
