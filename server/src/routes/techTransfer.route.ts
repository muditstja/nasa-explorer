import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate';
import { getTechTransfer } from '../controllers/techTransfer.controller';

const router = Router();

const Query = z.object({
  query: z.object({
    category: z.string(),        // patent | software | spinoff
    query: z.string(),
    page: z.string()
  })
});

router.get('/', validate(Query), getTechTransfer);

export default router;
