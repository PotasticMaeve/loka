import { BookingStatus } from '@prisma/client';
import { formatInTimeZone } from 'date-fns-tz';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/AppError.js';
import { operatingWindow, isOnLocalHour, pad2 } from '../../lib/time.js';
import type { AuthUser } from '../../lib/jwt.js';
import type { CreateBookingInput, ListBookingsQuery } from './booking.schema.js';

const HOUR_MS = 60 * 60 * 1000;
const CANCEL_CUTOFF_MS = 2 * HOUR_MS;

const roomSummary = {
  id: true,
  name: true,
  capacity: true,
  pricePerHour: true,
} as const;

const userSummary = {
  id: true,
  name: true,
  email: true,
} as const;

export async function createBooking(actor: AuthUser, input: CreateBookingInput) {
  const start = new Date(input.startTime);
  const end = new Date(input.endTime);

  return prisma.$transaction(async (tx) => {
    // Row-level lock on the room. Two concurrent requests for the same room
    // are now processed one after another (the second waits for this lock),
    // so the overlap check below cannot race.
    const locked = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "Room" WHERE id = ${input.roomId} FOR UPDATE
    `;

    if (locked.length === 0) {
      throw AppError.notFound('Room not found');
    }

    const room = await tx.room.findUnique({ where: { id: input.roomId } });

    if (!room || !room.isActive) {
      throw AppError.notFound('Room not found or inactive');
    }

    const settings = await tx.setting.findUnique({ where: { id: 1 } });
    const openHour = settings?.openHour ?? 9;
    const closeHour = settings?.closeHour ?? 21;
    const timezone = settings?.timezone ?? 'Asia/Jakarta';

    if (!isOnLocalHour(start, timezone) || !isOnLocalHour(end, timezone)) {
      throw new AppError(400, 'startTime and endTime must start on a full hour', 'INVALID_SLOT');
    }

    if (start.getTime() <= Date.now()) {
      throw new AppError(400, 'startTime must be in the future', 'INVALID_SLOT');
    }

    const localDate = formatInTimeZone(start, timezone, 'yyyy-MM-dd');
    const { open, close } = operatingWindow(localDate, timezone, openHour, closeHour);

    if (start.getTime() < open.getTime() || end.getTime() > close.getTime()) {
      throw new AppError(
        400,
        `Booking must be within operating hours (${pad2(openHour)}:00-${pad2(closeHour)}:00 ${timezone})`,
        'OUTSIDE_OPERATING_HOURS',
      );
    }

    const conflict = await tx.booking.findFirst({
      where: {
        roomId: room.id,
        status: BookingStatus.CONFIRMED,
        startTime: { lt: end },
        endTime: { gt: start },
      },
      select: { id: true, startTime: true, endTime: true },
    });

    if (conflict) {
      throw new AppError(
        409,
        'This time slot was just booked by someone else. Please pick another slot.',
        'BOOKING_CONFLICT',
      );
    }

    const hours = (end.getTime() - start.getTime()) / HOUR_MS;

    return tx.booking.create({
      data: {
        userId: actor.id,
        roomId: room.id,
        startTime: start,
        endTime: end,
        totalPrice: hours * room.pricePerHour,
      },
      include: { room: { select: roomSummary } },
    });
  });
}

export function listMyBookings(userId: string, query: ListBookingsQuery) {
  return prisma.booking.findMany({
    where: {
      userId,
      ...(query.status ? { status: query.status } : {}),
    },
    include: { room: { select: roomSummary } },
    orderBy: { startTime: 'desc' },
  });
}

export function listAllBookings(query: ListBookingsQuery) {
  return prisma.booking.findMany({
    where: query.status ? { status: query.status } : {},
    include: {
      room: { select: roomSummary },
      user: { select: userSummary },
    },
    orderBy: { startTime: 'desc' },
    take: 200,
  });
}

export async function getBooking(id: string, actor: AuthUser) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      room: { select: roomSummary },
      user: { select: userSummary },
    },
  });

  if (!booking) {
    throw AppError.notFound('Booking not found');
  }

  if (actor.role !== 'ADMIN' && booking.userId !== actor.id) {
    throw AppError.forbidden('You can only view your own bookings');
  }

  return booking;
}

export async function cancelBooking(id: string, actor: AuthUser) {
  const booking = await prisma.booking.findUnique({ where: { id } });

  if (!booking) {
    throw AppError.notFound('Booking not found');
  }

  if (actor.role !== 'ADMIN' && booking.userId !== actor.id) {
    throw AppError.forbidden('You can only cancel your own booking');
  }

  if (booking.status !== BookingStatus.CONFIRMED) {
    throw new AppError(409, `Cannot cancel a ${booking.status} booking`, 'INVALID_STATUS');
  }

  // Users must cancel at least 2 hours before the start time; admins can force it.
  if (actor.role !== 'ADMIN' && booking.startTime.getTime() - Date.now() < CANCEL_CUTOFF_MS) {
    throw new AppError(
      409,
      'Bookings can only be cancelled at least 2 hours before the start time',
      'CANCEL_WINDOW_CLOSED',
    );
  }

  // updateMany + status filter makes the transition atomic even if two
  // cancel requests arrive at the same time.
  const result = await prisma.booking.updateMany({
    where: { id, status: BookingStatus.CONFIRMED },
    data: { status: BookingStatus.CANCELLED },
  });

  if (result.count === 0) {
    throw new AppError(409, 'Booking is no longer confirmed', 'INVALID_STATUS');
  }

  return prisma.booking.findUniqueOrThrow({
    where: { id },
    include: { room: { select: roomSummary } },
  });
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const booking = await prisma.booking.findUnique({ where: { id } });

  if (!booking) {
    throw AppError.notFound('Booking not found');
  }

  return prisma.booking.update({
    where: { id },
    data: { status },
    include: {
      room: { select: roomSummary },
      user: { select: userSummary },
    },
  });
}
