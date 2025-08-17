import { config } from './config';

type FetchOpts = {
  searchParams?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

const BASE = {
  nasaApi: 'https://api.nasa.gov',
  events: 'https://eonet.gsfc.nasa.gov/api/v3'
};

export const urls = {
  apod: () => `${BASE.nasaApi}/planetary/apod`,
  neoFeed: () => `${BASE.nasaApi}/neo/rest/v1/feed`,
  marsPhotos: (rover: string) => `${BASE.nasaApi}/mars-photos/api/v1/rovers/${rover}/photos`,
  eonetSearch: (status: string, days: number, limit: number) => `${BASE.events}/events?status=${status}&days=${days}&limit=${limit}`,
  donkiFetch: () => `${BASE.nasaApi}/DONKI/notifications`,
  techTransferFetch: (category: string) => `${BASE.nasaApi}/techtransfer/${category}/`
};

export async function nasaFetch<T>(url: string, opts: FetchOpts = {}): Promise<T> {
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), opts.timeoutMs ?? 19000);

  const searchParams = new URLSearchParams();
  searchParams.set('api_key', config.nasaKey);
  for (const [k, v] of Object.entries(opts.searchParams ?? {})) {
    if (v !== undefined && v !== null && v !== '') searchParams.set(k, String(v));
  }
  const finalUrl = url.includes('?') ? `${url}&${searchParams.toString()}` : `${url}?${searchParams.toString()}`;

  try {
    console.log("before hit = ", finalUrl);
    const res = await fetch(finalUrl, {
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
