import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/AppError.js';
import { signToken } from '../../lib/jwt.js';
import type { LoginInput, RegisterInput } from './auth.schema.js';

// Never return passwordHash to the client.
const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
} as const;

export async function register(input: RegisterInput) {
  const passwordHash = await bcrypt.hash(input.password, 12);

  try {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
      },
      select: publicUserSelect,
    });

    return { user, token: signToken({ id: user.id, email: user.email, role: user.role }) };
  } catch (error) {
    // Unique constraint on User.email (race-safe alternative to a pre-check).
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError(409, 'Email is already registered', 'EMAIL_TAKEN');
    }
    throw error;
  }
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Same message for unknown email and wrong password: do not leak which one.
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw AppError.unauthorized('Invalid email or password');
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    },
    token: signToken({ id: user.id, email: user.email, role: user.role }),
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });

  if (!user) {
    throw AppError.unauthorized('User no longer exists');
  }

  return user;
}
