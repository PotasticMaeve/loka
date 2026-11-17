import type { RequestHandler } from 'express';
import type { Role } from '@prisma/client';
import { AppError } from '../lib/AppError.js';
import { verifyToken } from '../lib/jwt.js';

function extractToken(authorization?: string): string | null {
  if (!authorization?.startsWith('Bearer ')) return null;
  const token = authorization.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

// Rejects the request unless it carries a valid "Authorization: Bearer <token>".
export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = extractToken(req.headers.authorization);

  if (!token) {
    return next(AppError.unauthorized());
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(AppError.unauthorized('Invalid or expired token'));
  }
};

// Usage: requireRole('ADMIN'). Must run after requireAuth.
export function requireRole(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }

    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden());
    }

    next();
  };
}
