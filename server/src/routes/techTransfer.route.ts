import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { withCache } from '../cache';
import { nasaFetch, urls } from '../nasaClient';
import type { SuccessEnvelope } from '../types';

const router = Router();

const Query = z.object({
  query: z.object({
    category: z.string(),
    query: z.string(),
    page: z.string()
  })
});

router.get('/', validate(Query), async (req, res, next) => {
  const { category, query, page  } = (req as any).validated.query as {category: string; query: string; page: string };
  const key = `techtransfer:$${category}:${query}:${page}`;
  try {
    const data = await withCache(key, () =>
      nasaFetch<any>(urls.techTransferFetch(category), { searchParams: { category, query, page } })
    );
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export default router;
