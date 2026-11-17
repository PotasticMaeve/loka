import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { roomRouter } from './modules/rooms/room.routes.js';
import { settingRouter } from './modules/settings/setting.routes.js';
import { availabilityRouter } from './modules/availability/availability.routes.js';
import { bookingRouter } from './modules/bookings/booking.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

export const app = express();

// Allow the frontend (Vite on port 5173) to call this API.
app.use(cors({ origin: env.CORS_ORIGIN }));
// Parse JSON request bodies into req.body automatically.
app.use(express.json());

// Health check: useful for the Docker healthcheck later,
// and proves both the API and the database are alive.
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      db: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: 'error',
      db: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

// Must be registered AFTER all routes.
app.use('/api/auth', authRouter);
app.use('/api/rooms', availabilityRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/settings', settingRouter);
app.use('/api/bookings', bookingRouter);

app.use(notFoundHandler);
app.use(errorHandler);
