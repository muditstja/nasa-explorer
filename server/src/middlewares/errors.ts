import type { NextFunction, Request, Response } from 'express';
import type { ErrorEnvelope } from '../interfaces/types';

export function notFound(_req: Request, res: Response<ErrorEnvelope>) {
  res.status(404).json({ ok: false, status: 404, message: 'Not Found' });
}

export function errorHandler(err: any, _req: Request, res: Response<ErrorEnvelope>, _next: NextFunction) {
  const status = typeof err.status === 'number' ? err.status : 500;
  const message = err?.message || 'Internal Server Error';
  const code = err?.code || (status >= 500 ? 'INTERNAL' : 'BAD_REQUEST');

  if (res.headersSent) {
    // eslint-disable-next-line no-console
    console.error('Headers already sent, error:', err);
    return;
  }

  res.status(status).json({
    ok: false,
    status,
    message,
    code,
    details: err?.details ?? null
  });
}
