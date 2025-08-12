import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { withCache } from '../cache';
import { nasaFetch, urls } from '../nasaClient';
import type { SuccessEnvelope } from '../types';

const router = Router();

const StatsQuery = z.object({
  query: z.object({
    start: z.string(), // YYYY-MM-DD
    end: z.string().optional()
  })
});

// Derived stats used by the frontend charts
router.get(
  '/stats',
  validate(StatsQuery),
  async (req, res, next) => {
    const { start, end } = (req as any).validated.query as { start: string; end?: string };
    const key = `neo:feed:${start}:${end ?? ''}`;
    try {
      const raw = await withCache(key, () =>
        nasaFetch<any>(urls.neoFeed(), { searchParams: { start_date: start, end_date: end } })
      );

      const daily = Object.entries(raw.near_earth_objects)
        .map(([date, arr]) => ({
          date,
          total: (arr as any[]).length,
          hazardous: (arr as any[]).filter(o => o.is_potentially_hazardous_asteroid).length
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const scatter = Object.values<any[]>(raw.near_earth_objects)
        .flat()
        .map(o => ({
          id: o.id,
          name: o.name,
          est_diam_km:
            (o.estimated_diameter.kilometers.estimated_diameter_min +
              o.estimated_diameter.kilometers.estimated_diameter_max) / 2,
          miss_km: Number(o.close_approach_data?.[0]?.miss_distance?.kilometers ?? NaN),
          vel_kps: Number(o.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second ?? NaN)
        }))
        .filter(p => Number.isFinite(p.miss_km) && Number.isFinite(p.est_diam_km));

      res.json({ ok: true, data: { daily, scatter } });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
