import type { Request, Response, NextFunction } from 'express';
import { withCache } from '../cache';
import { nasaFetch, urls } from '../nasaClient';

export async function getEonetEvents(req: Request, res: Response, next: NextFunction) {
  const { status, days, limit } = (req as any).validated.query as { status: 'open' | 'closed' | 'all'; days?: number; limit?: number };
  const key = `eonet:${status}:${days ?? '30'}:${limit ?? '200'}`;

  try {
    const url = urls.eonetSearch(status, Number(days ?? 30), Number(limit ?? 200));
    const data = await withCache(key, () => nasaFetch<any>(url));
    res.json(data);
  } catch (err) {
    next(err);
  }
}