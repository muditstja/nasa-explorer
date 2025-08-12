export type SuccessEnvelope<T> = { ok: true; data: T };
export type ErrorEnvelope = {
  ok: false;
  status: number;
  message: string;
  code?: string;
  details?: unknown;
};
