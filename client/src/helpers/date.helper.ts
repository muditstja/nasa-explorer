export const formatNumbers = (num: number|string) => typeof num ==='number' ? num.toLocaleString() : num;

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

export function isoDaysAgo(num: number) {
  const d = new Date(Date.now() - num * 86400000);
  return d.toISOString().slice(0, 10);
}

export function diffDays(a: string, b: string) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
}

export function enumerateDays(startDate: string, endDate: string) {
  const out: string[] = [];
  let start = Date.parse(startDate);
  let stop = Date.parse(endDate);

  if (isNaN(start) || isNaN(stop)) return out;

  if (start > stop) [start, stop] = [stop, start];
  for (let x = start; x <= stop; x += 86400000)
    out.push(new Date(x).toISOString().slice(0, 10));
  return out;
}
