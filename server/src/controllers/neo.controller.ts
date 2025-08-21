import type { Request, Response, NextFunction } from 'express';
import { withCache } from '../utils/cache';
import { nasaFetch, urls } from '../nasaApi.service';
import { NeoObject } from '../interfaces/types';


export async function getNeoStats(req: Request, res: Response, next: NextFunction) {
  const { start_date, end_date } = (req as any).validated.query as { start_date: string; end_date?: string };
  const cacheKey = `neo:feed:${start_date}:${end_date ?? ''}`;

  try {
    const feed = await withCache(cacheKey, () =>
      nasaFetch<any>(urls.neoFeed(), { searchParams: { start_date, ...(end_date ? { end_date } : {}) } }),
    );

    // flatten NEOs from the feed into a simple array
    const objects: NeoObject[] | any[] = Object.values(feed?.near_earth_objects ?? {}).flat();

    res.json({objects});
  } catch (err) {
    next(err);
  }
}