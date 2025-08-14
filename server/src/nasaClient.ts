import { config } from './config';

type FetchOpts = {
  searchParams?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

const BASE = {
  apod: 'https://api.nasa.gov/planetary/apod',
  neoFeed: 'https://api.nasa.gov/neo/rest/v1/feed',
  mars: 'https://api.nasa.gov/mars-photos/api/v1',
  epic: 'https://api.nasa.gov/EPIC/api/natural',
  library: 'https://images-api.nasa.gov',
  events: 'https://eonet.gsfc.nasa.gov/api/v3'
};

export const urls = {
  apod: () => BASE.apod,
  neoFeed: () => BASE.neoFeed,
  marsPhotos: (rover: string) => `${BASE.mars}/rovers/${rover}/photos`,
  epicByDate: (date: string) => `${BASE.epic}/date/${date}`,
  librarySearch: () => `${BASE.library}/search`,
  eonentSearch: (status: string, days: number, limit: number) => `${BASE.events}/events?status=${status}&days=${days}&limit=${limit}`
};

export async function nasaFetch<T>(url: string, opts: FetchOpts = {}): Promise<T> {
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), opts.timeoutMs ?? 10000);

  const searchParams = new URLSearchParams();
  searchParams.set('api_key', config.nasaKey);
  for (const [k, v] of Object.entries(opts.searchParams ?? {})) {
    if (v !== undefined && v !== null && v !== '') searchParams.set(k, String(v));
  }
  const full = url.includes('?') ? `${url}&${searchParams.toString()}` : `${url}?${searchParams.toString()}`;

  try {
    const res = await fetch(full, {
      signal: opts.signal ?? controller.signal,
      headers: { 'user-agent': 'nasa-explorer/1.0', ...(opts.headers ?? {}) }
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const err: any = new Error(`NASA API ${res.status}: ${text || res.statusText}`);
      err.status = res.status;
      err.code = 'NASA_API_ERROR';
      throw err;
    }

    const type = res.headers.get('content-type') ?? '';
    return (type.includes('application/json') ? await res.json() : await res.text()) as T;
  } finally {
    clearTimeout(to);
  }
}
