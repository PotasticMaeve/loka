import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { requireAuth } from '../../middlewares/auth.js';
import { loginSchema, registerSchema } from './auth.schema.js';
import * as authService from './auth.service.js';

export const authRouter = Router();

// Express 5 automatically forwards rejected promises to the error handler,
// so async handlers do not need try/catch.
authRouter.post('/register', validate({ body: registerSchema }), async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

authRouter.post('/login', validate({ body: loginSchema }), async (req, res) => {
  const result = await authService.login(req.body);
  res.json(result);
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await authService.getMe(req.user!.id);
  res.json({ user });
});
