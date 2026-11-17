import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../lib/AppError.js';

type RequestPart = 'body' | 'query' | 'params';
type ValidationSchemas = Partial<Record<RequestPart, ZodType>>;

// Usage: router.post('/', validate({ body: createRoomSchema }), handler)
// On success, req.body/query/params are replaced by the parsed (and coerced)
// values, so handlers receive trusted data.
export function validate(schemas: ValidationSchemas): RequestHandler {
  return (req, _res, next) => {
    for (const part of ['body', 'query', 'params'] as const) {
      const schema = schemas[part];
      if (!schema) continue;

      const result = schema.safeParse(req[part]);

      if (!result.success) {
        const details = result.error.issues.map((issue) => ({
          field: issue.path.join('.') || part,
          message: issue.message,
        }));
        return next(new AppError(400, 'Validation failed', 'VALIDATION_ERROR', details));
      }

      // Express 5 defines req.query as a getter, so a plain assignment would
      // throw. defineProperty lets us replace it with the parsed value.
      Object.defineProperty(req, part, {
        value: result.data,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }

    next();
  };
}
