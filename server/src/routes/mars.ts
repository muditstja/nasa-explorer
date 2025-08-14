import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { withCache } from '../cache';
import { nasaFetch, urls } from '../nasaClient';
import type { SuccessEnvelope } from '../types';

const router = Router();

const PhotosQuery = z.object({
  query: z.object({
    rover: z.enum(['curiosity', 'opportunity', 'spirit']).default('curiosity'),
    earth_date: z.string().optional(),
    sol: z.string().optional(),
    camera: z.string().optional(),
    page: z.coerce.number().optional()
  })
});

router.get('/', validate(PhotosQuery), async (req, res, next) => {
  const { rover, earth_date, sol, camera, page } = (req as any).validated.query as any;
  const key = `mars:${rover}:${earth_date ?? sol ?? 'latest'}:${camera ?? 'all'}:${page ?? 1}`;
  try {
    const data = await withCache(key, () =>
      nasaFetch<any>(urls.marsPhotos(rover), { searchParams: { earth_date, sol, camera, page } })
    );
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export default router;
