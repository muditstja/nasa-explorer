import { defer, map, catchError, of, shareReplay } from "rxjs";
export function fetchEonetEvents$(
  days: number,
  status: "open" | "closed" | "all" = "open",
  limit = 800
) {
  return defer(async () => {
    const url = new URL("https://eonet.gsfc.nasa.gov/api/v3/events");
    url.searchParams.set("status", status);
    url.searchParams.set("days", String(days));
    url.searchParams.set("limit", String(limit));
    const r = await fetch(url.toString());
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }).pipe(
    map((json: any) => (Array.isArray(json) ? json : json.events || [])),
    catchError((err) =>
      of({ error: err?.message || "EONET error", events: [] } as any)
    ),
    shareReplay(1)
  );
}
