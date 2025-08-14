import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { withCache } from '../cache';
import { nasaFetch, urls } from '../nasaClient';
import type { SuccessEnvelope } from '../types';

const router = Router();

const Query = z.object({
  query: z.object({
    days: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    status: z.enum(['open', 'close']).default('open')
  })
});

router.get('/', validate(Query), async (req, res, next) => {
  const { status, days, limit  } = (req as any).validated.query as { days: number; limit: number; status: string };
  const key = `neo:${days ?? 7}:${limit ?? 100}:${status}`;
  try {
    const data = await withCache(key, () =>
      nasaFetch<any>(urls.eonetSearch(status, days, limit))
    );
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export default router;
