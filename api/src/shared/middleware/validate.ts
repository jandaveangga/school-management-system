import type { RequestHandler } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';

import { ValidationError } from '../errors/app-error.js';

export interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Per-route Zod validation. Each section (body/query/params) is parsed via
 * `parseAsync`; output replaces the original. Fail throws `ValidationError`
 * with `error.flatten()` as `details`.
 */
export const validate = (schemas: ValidationSchemas): RequestHandler => {
  return async (req, _res, next) => {
    try {
      if (schemas.body !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        req.body = await schemas.body.parseAsync(req.body);
      }

      if (schemas.query !== undefined) {
        const parsedQuery: unknown = await schemas.query.parseAsync(
          req.query
        );

        // Express 5 exposes req.query as a getter; shadow it with own property.
        Object.defineProperty(req, 'query', {
          value: parsedQuery,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }

      if (schemas.params !== undefined) {
        const parsedParams: unknown = await schemas.params.parseAsync(
          req.params
        );

        Object.defineProperty(req, 'params', {
          value: parsedParams,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(
          new ValidationError(
            'Request validation failed',
            err.flatten()
          )
        );
        return;
      }

      next(err);
    }
  };
};