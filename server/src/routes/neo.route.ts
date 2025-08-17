import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { withCache } from '../cache';
import { nasaFetch, urls } from '../nasaClient';
import type { SuccessEnvelope } from '../types';

const router = Router();

const StatsQuery = z.object({
  query: z.object({
    start_date: z.string(), // YYYY-MM-DD
    end_date: z.string().optional()
  })
});

// Derived stats used by the frontend charts
router.get('/',  validate(StatsQuery), async (req, res, next) => {
    const { start_date, end_date } = (req as any).validated.query as { start_date: string; end_date?: string };
    const key = `neo:feed:${start_date}:${end_date ?? ''}`;
    try {
      const data = await withCache(key, () => nasaFetch<any>(urls.neoFeed(), { searchParams: { start_date, end_date } }));
      const objects = Object.values(data.near_earth_objects || {}).flat();

      res.json({ objects });

    } catch (e) {
      next(e);
    }
  }
);

export default router;
