import type { AuthUser } from '../lib/jwt.js';

// Lets TypeScript know that requireAuth attaches `user` to the request.
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
