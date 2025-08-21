import type { Request, Response, NextFunction } from 'express';
import { withCache } from '../utils/cache';
import { nasaFetch, urls } from '../nasaApi.service';

export async function getDonki(req: Request, res: Response, next: NextFunction) {
  const { start_date, end_date, type } = (req as any).validated.query as { start_date: string; end_date: string; type: string };
  const key = `donki:${start_date}:${end_date}:${type}`;

  try {
    const data = await withCache(key, () =>
      nasaFetch<any>(urls.donkiFetch(), {
        searchParams: { startDate: start_date, endDate: end_date, type },
      }),
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
}