import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { withCache } from '../cache';
import { nasaFetch, urls } from '../nasaClient';
import type { SuccessEnvelope } from '../types';

const router = Router();

const Query = z.object({
  query: z.object({ date: z.string() }) // YYYY-MM-DD
});

router.get('/', validate(Query), async (req, res, next) => {
  const { date } = (req as any).validated.query as { date: string };
  const key = `epic:${date}`;
  try {
    const items = await withCache(key, () => nasaFetch<any[]>(urls.epicByDate(date)));
    const [y, m, d] = date.split('-');
    const images = items.map(x => ({
      caption: x.caption,
      identifier: x.identifier,
      centroid_coordinates: x.centroid_coordinates,
      image: `https://epic.gsfc.nasa.gov/archive/natural/${y}/${m}/${d}/png/${x.image}.png`,
      thumb: `https://epic.gsfc.nasa.gov/archive/natural/${y}/${m}/${d}/jpg/${x.image}.jpg`,
      date: x.date
    }));
    res.json({ ok: true, data: images });
  } catch (e) {
    next(e);
  }
});

export default router;
