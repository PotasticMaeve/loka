import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { roomIdSchema } from '../rooms/room.schema.js';
import { availabilityQuerySchema } from './availability.schema.js';
import * as availabilityService from './availability.service.js';

export const availabilityRouter = Router();

// GET /api/rooms/:id/availability?date=YYYY-MM-DD
availabilityRouter.get(
  '/:id/availability',
  validate({ params: roomIdSchema, query: availabilityQuerySchema }),
  async (req, res) => {
    const { id } = req.params as { id: string };
    const { date } = req.query as { date: string };
    const result = await availabilityService.getRoomAvailability(id, date);
    res.json(result);
  },
);
