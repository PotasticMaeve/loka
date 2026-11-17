import { z } from 'zod';

const HOUR_MS = 60 * 60 * 1000;

const isoDateTime = z
  .string()
  .datetime({ offset: true, message: 'Must be an ISO 8601 datetime, e.g. 2026-11-18T01:00:00.000Z' });

export const bookingIdSchema = z.object({
  id: z.string().min(1, 'Booking id is required'),
});

export const createBookingSchema = z
  .object({
    roomId: z.string().min(1, 'roomId is required'),
    startTime: isoDateTime,
    endTime: isoDateTime,
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startTime).getTime();
    const end = new Date(data.endTime).getTime();
    const duration = end - start;

    if (duration <= 0) {
      ctx.addIssue({ code: 'custom', message: 'endTime must be after startTime', path: ['endTime'] });
      return;
    }

    if (duration < HOUR_MS) {
      ctx.addIssue({ code: 'custom', message: 'Booking must be at least 1 hour', path: ['endTime'] });
    } else if (duration % HOUR_MS !== 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Booking duration must be in whole-hour increments',
        path: ['endTime'],
      });
    }

    if (start <= Date.now()) {
      ctx.addIssue({ code: 'custom', message: 'startTime must be in the future', path: ['startTime'] });
    }
  });

export const bookingStatusSchema = z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED']);

export const listBookingsQuerySchema = z.object({
  status: bookingStatusSchema.optional(),
});

export const updateBookingStatusSchema = z.object({
  // Reopening a cancelled/completed booking could conflict with new bookings,
  // so this endpoint only allows closing a booking.
  status: z.enum(['CANCELLED', 'COMPLETED'], {
    message: 'status must be CANCELLED or COMPLETED',
  }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
