import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { withCache } from '../cache';
import { nasaFetch, urls } from '../nasaClient';
import type { SuccessEnvelope } from '../types';

const router = Router();

const Query = z.object({
  query: z.object({
    start_date: z.string(), // YYYY-MM-DD
    end_date: z.string(),
    type: z.string()
  })
});

router.get('/', validate(Query), async (req, res, next) => {
  const { start_date, end_date, type  } = (req as any).validated.query as {start_date: string; end_date?: string; type: string };
  const key = `donki:$${start_date}:${end_date}:${type ?? 'ALL'}`;
  try {
    const data = await withCache(key, () =>
      nasaFetch<any>(urls.donkiFetch(), { searchParams: { start_date, end_date, type } })
    );
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export default router;
