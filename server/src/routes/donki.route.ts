import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate';
import { getDonki } from '../controllers/donki.controller';

const router = Router();

const Query = z.object({
  query: z.object({
    start_date: z.string(), // YYYY-MM-DD
    end_date: z.string(),   // YYYY-MM-DD
    type: z.string()        // e.g., ALL, CME, FLR, ...
  })
});

router.get('/', validate(Query), getDonki);

export default router;
