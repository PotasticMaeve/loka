import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/AppError.js';
import { env } from '../config/env.js';

// Any request that reaches this point matched no route.
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, `Route ${req.method} ${req.originalUrl} not found`, 'NOT_FOUND'));
};

// Express recognises this as an error handler because it has 4 parameters.
// Every error becomes one consistent JSON shape:
// { "error": { "code": "...", "message": "...", "details": ... } }
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details === undefined ? {} : { details: err.details }),
      },
    });
    return;
  }

  // Zod errors thrown outside the validate middleware (e.g. manual parsing).
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
    return;
  }

  // Unexpected error: log the real thing, never leak internals in production.
  console.error('[UNHANDLED ERROR]', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message:
        env.NODE_ENV === 'production'
          ? 'Internal server error'
          : err instanceof Error
            ? err.message
            : 'Internal server error',
    },
  });
};
