// import { Router } from 'express';
// import { z } from 'zod';
// import { validate } from '../middleware/validate';
// import { withCache } from '../cache';
// import { nasaFetch, urls } from '../nasaClient';
// import type { SuccessEnvelope } from '../types';

// const router = Router();

// const Query = z.object({
//   query: z.object({
//     q: z.string().min(1),
//     media_type: z.string().optional(), // image, video, audio
//     page: z.coerce.number().optional()
//   })
// });

// router.get('/search', validate(Query), async (req, res, next) => {
//   const { q, media_type, page } = (req as any).validated.query as { q: string; media_type?: string; page?: number };
//   const key = `lib:${q}:${media_type ?? 'any'}:${page ?? 1}`;
//   try {
//     const raw = await withCache(key, () =>
//       nasaFetch<any>(urls.librarySearch(), { searchParams: { q, media_type, page } })
//     );
//     const items = (raw.collection?.items ?? []).map((it: any) => {
//       const data = it.data?.[0] ?? {};
//       const links = it.links?.[0] ?? {};
//       return {
//         nasa_id: data.nasa_id,
//         title: data.title,
//         description: data.description,
//         date_created: data.date_created,
//         thumbnail: links.href,
//         media_type: data.media_type
//       };
//     });
//     res.json({ ok: true, data: { items } });
//   } catch (e) {
//     next(e);
//   }
// });

// export default router;
