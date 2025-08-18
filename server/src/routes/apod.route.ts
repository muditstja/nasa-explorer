import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { withCache } from '../cache';
import { nasaFetch, urls } from '../nasaClient';
import type { SuccessEnvelope } from '../types';

const router = Router();

const Query = z.object({
  query: z.object({
    date: z.string().optional(), // YYYY-MM-DD
    hd: z.coerce.boolean().optional()
  })
});

router.get('/', validate(Query), async (req, res, next) => {

  const { date, hd } = (req as any).validated.query as { date?: string; hd?: boolean };
  const key = `apod:${date ?? 'today'}:${hd ? '1' : '0'}`;

  try {
    const data = await withCache(key, () =>
      nasaFetch<any>(urls.apod(), { searchParams: { date } })
    );

    res.json(data);
  } catch (e) {
    next(e);
  }
});

export default router;
