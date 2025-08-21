import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate';
import { getEonetEvents } from '../controllers/eonet.controller';

const router = Router();

const Query = z.object({
  query: z.object({
    status: z.enum(['open', 'closed', 'all']).default('open'),
    days: z.coerce.number().optional(),
    limit: z.coerce.number().optional()
  })
});

router.get('/', validate(Query), getEonetEvents);

export default router;
