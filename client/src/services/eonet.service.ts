import { defer, map, catchError, of, shareReplay } from 'rxjs';
import { fetchEonet } from './api.service';


export function fetchEonetEvents$(
  days: number,
  status: 'open' | 'closed' | 'all' = 'open',
  limit = 800
) {
  return defer(async (): Promise<any> => {
    // Call backend via the api layer
    const res = await fetchEonet({ days, status, limit });
    const events = Array.isArray(res) ? res : res.events ?? [];
    return { events };
  }).pipe(
    catchError((err) =>
      of({ events: [], error: err?.message || 'EONET error' } as any)
    ),
    shareReplay(1) // memoize last value for late subscribers
  );
}
