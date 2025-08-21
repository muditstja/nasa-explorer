import type { Request, Response, NextFunction } from 'express';
import { withCache } from '../utils/cache';
import { nasaFetch, urls } from '../nasaApi.service';

/** Utility: safely parse boolean from query strings like "true"/"1" */
const toBool = (v: unknown) =>
  typeof v === 'string' ? ['1', 'true', 'yes', 'on'].includes(v.toLowerCase()) : !!v;

/** ---------------- APOD ---------------- */
export async function getApod(req: Request, res: Response, next: NextFunction) {
  const { date, hd } = (req as any).validated.query as { date?: string; hd?: boolean | string };
  const isHd = toBool(hd);
  const cacheKey = `apod:${date ?? 'today'}:${isHd ? 'hd' : 'sd'}`;

  try {
    const data = await withCache(cacheKey, () =>
      nasaFetch<any>(urls.apod(), { searchParams: { ...(date ? { date } : {}), ...(isHd ? { hd: true } : {}) } }),
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
}