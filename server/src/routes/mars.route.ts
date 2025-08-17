import { Router } from 'express';

// Zod for schema validation (runtime + TypeScript types)
import { z as zod } from 'zod';
import { validate } from '../middleware/validate';
import { withCache } from '../cache';
import { nasaFetch, urls } from '../nasaClient';

// Create an Express Router instance to group related routes
const router = Router();

/**
 * Zod schema to validate query params for Mars Rover Photos endpoint
 * - "rover": one of 'curiosity', 'opportunity', 'spirit' (default = 'curiosity')
 * - "earth_date": optional, date string in YYYY-MM-DD format
 * - "sol": optional, Martian day number
 * - "camera": optional, specific rover camera name
 * - "page": optional, coerced to number (pagination)
 */
const PhotosQuery = zod.object({
  query: zod.object({
    rover: zod.enum(['curiosity', 'opportunity', 'spirit']).default('curiosity'),
    earth_date: zod.string().optional(),
    sol: zod.string().optional(),
    camera: zod.string().optional(),
    page: zod.coerce.number().optional()
  })
});

/**
 * GET /  —  Mars Rover Photos
 * Validates incoming request query parameters using `validate(PhotosQuery)`
 * Calls NASA Mars Rover Photos API, caches results, and returns JSON
 */
router.get('/', validate(PhotosQuery), async (req, res, next) => {
    // Extract validated query params from middleware
    const { rover, earth_date, sol, camera, page } = (req as any).validated.query as any;
    
    // Create a unique cache key based on query params
    const key = `mars:${rover}:${earth_date ?? sol ?? 'latest'}:${camera ?? 'all'}:${page ?? 1}`;

    try {
      /**
       * Fetch data with caching
       * - `withCache(key, fetchFn)` checks cache first
       * - If no cache hit, calls fetchFn and stores result in cache
       * - nasaFetch calls NASA API, urls.marsPhotos(rover) builds the endpoint URL
       */
      const data = await withCache(key, () => nasaFetch<any>(urls.marsPhotos(rover), { searchParams: { earth_date, sol, camera, page } }));
      res.json(data);

    } catch (e) {
      // Forward any errors to Express error handler
      next(e);
    }
  }
);

export default router;
