import type { Request, Response, NextFunction } from 'express';
import { withCache } from '../utils/cache';
import { nasaFetch, urls } from '../nasaApi.service';

export async function getMarsPhotos(req: Request, res: Response, next: NextFunction) {
  const { rover, earth_date, sol, camera, page } = (req as any).validated.query as {
    rover: 'curiosity' | 'opportunity' | 'spirit';
    earth_date?: string;
    sol?: string;
    camera?: string;
    page?: number;
  };

  const windowTag = earth_date ?? sol ?? 'latest';
  const cacheKey = `mars:${rover}:${windowTag}:${camera ?? 'all'}:${page ?? 1}`;

  try {
    const data = await withCache(cacheKey, () =>
      nasaFetch<any>(urls.marsPhotos(rover), {
        searchParams: { ...(earth_date ? { earth_date } : {}), ...(sol ? { sol } : {}), ...(camera ? { camera } : {}), ...(page ? { page } : {}) },
      }),
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
}