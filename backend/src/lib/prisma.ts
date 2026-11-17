import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '../config/env.js';

// adapter-pg owns the PostgreSQL connection.
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

// When `tsx watch` restarts a file, modules can be re-evaluated.
// Keep the instance on globalThis so connections do not leak (pool exhaustion).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
