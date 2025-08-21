import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { getApod } from '../controller/apod.controller';

const router = Router();

const Query = z.object({
  query: z.object({
    date: z.string().optional(),         // YYYY-MM-DD
    hd: z.coerce.boolean().optional()
  })
});

router.get('/', validate(Query), getApod);

export default router;
