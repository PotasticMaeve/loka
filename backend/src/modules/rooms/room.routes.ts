import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { createRoomSchema, roomIdSchema, updateRoomSchema } from './room.schema.js';
import * as roomService from './room.service.js';

export const roomRouter = Router();

// Public: only active rooms.
roomRouter.get('/', async (_req, res) => {
  const rooms = await roomService.listActiveRooms();
  res.json({ rooms });
});

// Admin: all rooms, including deactivated ones.
// Declared BEFORE "/:id" so "all" is not mistaken for an id.
roomRouter.get('/all', requireAuth, requireRole('ADMIN'), async (_req, res) => {
  const rooms = await roomService.listAllRooms();
  res.json({ rooms });
});

roomRouter.get('/:id', validate({ params: roomIdSchema }), async (req, res) => {
  const { id } = req.params as { id: string };
  const room = await roomService.getRoomById(id);
  res.json({ room });
});

roomRouter.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  validate({ body: createRoomSchema }),
  async (req, res) => {
    const room = await roomService.createRoom(req.body);
    res.status(201).json({ room });
  },
);

roomRouter.patch(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  validate({ params: roomIdSchema, body: updateRoomSchema }),
  async (req, res) => {
    const { id } = req.params as { id: string };
    const room = await roomService.updateRoom(id, req.body);
    res.json({ room });
  },
);

roomRouter.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  validate({ params: roomIdSchema }),
  async (req, res) => {
    const { id } = req.params as { id: string };
    const room = await roomService.deactivateRoom(id);
    res.json({ room, message: 'Room deactivated' });
  },
);
