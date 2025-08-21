import type { Request, Response, NextFunction } from 'express';
import { withCache } from '../cache';
import { nasaFetch, urls } from '../nasaClient';

type NeoObject = {
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