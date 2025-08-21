import type { Request, Response, NextFunction } from 'express';
import { withCache } from '../cache';
import { nasaFetch, urls } from '../nasaClient';


export async function getTechTransfer(req: Request, res: Response, next: NextFunction) {
  const { category, query, page } = (req as any).validated.query as { category: string; query: string; page: string };
  const key = `tech:${category}:${query}:${page}`;

  try {
    const data = await withCache(key, () =>
      nasaFetch<any>(urls.techTransferFetch(category), {
        searchParams: { q: query, page, engine: 'true' },
      }),
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
}