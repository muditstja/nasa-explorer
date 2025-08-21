import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { getMarsPhotos } from '../controller/marsRover.controller';

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

router.get('/', validate(PhotosQuery), getMarsPhotos);

export default router;
