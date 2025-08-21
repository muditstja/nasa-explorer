import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { getNeoStats } from '../controller/neo.controller';

const router = Router();

const StatsQuery = z.object({
  query: z.object({
    start_date: z.string(),            // YYYY-MM-DD
    end_date: z.string().optional()
  })
});

router.get('/', validate(StatsQuery), getNeoStats);

export default router;
