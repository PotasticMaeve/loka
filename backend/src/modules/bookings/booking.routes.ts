import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { requireAuth, requireRole } from '../../middlewares/auth.js';
import {
  bookingIdSchema,
  createBookingSchema,
  listBookingsQuerySchema,
  updateBookingStatusSchema,
} from './booking.schema.js';
import * as bookingService from './booking.service.js';

export const bookingRouter = Router();

// All booking endpoints require a logged-in user.
bookingRouter.use(requireAuth);

// Declared before "/:id" so "me" is not treated as an id.
bookingRouter.get('/me', validate({ query: listBookingsQuerySchema }), async (req, res) => {
  const bookings = await bookingService.listMyBookings(req.user!.id, req.query);
  res.json({ bookings });
});

bookingRouter.get(
  '/',
  requireRole('ADMIN'),
  validate({ query: listBookingsQuerySchema }),
  async (req, res) => {
    const bookings = await bookingService.listAllBookings(req.query);
    res.json({ bookings });
  },
);

bookingRouter.post('/', validate({ body: createBookingSchema }), async (req, res) => {
  const booking = await bookingService.createBooking(req.user!, req.body);
  res.status(201).json({ booking });
});

bookingRouter.get('/:id', validate({ params: bookingIdSchema }), async (req, res) => {
  const { id } = req.params as { id: string };
  const booking = await bookingService.getBooking(id, req.user!);
  res.json({ booking });
});

bookingRouter.patch(
  '/:id/cancel',
  validate({ params: bookingIdSchema }),
  async (req, res) => {
    const { id } = req.params as { id: string };
    const booking = await bookingService.cancelBooking(id, req.user!);
    res.json({ booking });
  },
);

bookingRouter.patch(
  '/:id/status',
  requireRole('ADMIN'),
  validate({ params: bookingIdSchema, body: updateBookingStatusSchema }),
  async (req, res) => {
    const { id } = req.params as { id: string };
    const booking = await bookingService.updateBookingStatus(id, req.body.status);
    res.json({ booking });
  },
);
