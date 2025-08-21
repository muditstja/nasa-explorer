import type { NextFunction, Request, Response } from 'express';
import { ZodError, type AnyZodObject } from 'zod';

export const validate = (schema: AnyZodObject) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        query: req.query,
        params: req.params,
        body: req.body
      });
      // attach safely
      (req as any).validated = parsed;
      next();
    } catch (error) {
      const err = new Error('Validation failed');
      (err as any).status = 400;
      (err as any).code = 'BAD_REQUEST';
      (err as any).details = error instanceof ZodError ? error.issues : undefined;
      next(err);
    }
  };
