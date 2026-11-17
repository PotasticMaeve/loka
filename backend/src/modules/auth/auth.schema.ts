import { z } from 'zod';

const email = z.string().trim().toLowerCase().email('Invalid email address');

export const registerSchema = z.object({
  email,
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
