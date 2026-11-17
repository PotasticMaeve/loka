import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../config/env.js';

// The minimal identity we put inside the JWT and later attach to req.user.
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export function signToken(user: AuthUser): string {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '7d' },
  );
}

export function verifyToken(token: string): AuthUser {
  const payload = jwt.verify(token, env.JWT_SECRET);

  if (
    typeof payload === 'string' ||
    typeof payload.sub !== 'string' ||
    typeof payload.email !== 'string' ||
    (payload.role !== 'USER' && payload.role !== 'ADMIN')
  ) {
    throw new Error('Invalid token payload');
  }

  return { id: payload.sub, email: payload.email, role: payload.role };
}
