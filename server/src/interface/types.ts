export type SuccessEnvelope<T> = { ok: true; data: T };

export type ErrorEnvelope = {
  ok: false;
  status: number;
  message: string;
  code?: string;
  details?: unknown;
};

export type NeoObject = {
  close_approach_data?: Array<{
    miss_distance?: { kilometers?: string };
    relative_velocity?: { kilometers_per_hour?: string };
    close_approach_date?: string;
    close_approach_date_full?: string;
  }>;
  estimated_diameter?: {
    meters?: { estimated_diameter_min?: number; estimated_diameter_max?: number };
  };
};

export type FetchOpts = {
  searchParams?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  timeoutMs?: number;
};