import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/AppError.js';
import { localWallClock } from '../../lib/time.js';
import { getSettings } from '../settings/setting.service.js';

export type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'PAST';

export interface AvailabilitySlot {
  hour: number;
  startTime: string;
  endTime: string;
  label: string;
  status: SlotStatus;
}


export async function getRoomAvailability(roomId: string, date: string) {
  const room = await prisma.room.findUnique({ where: { id: roomId } });

  if (!room || !room.isActive) {
    throw AppError.notFound('Room not found or inactive');
  }

  const { openHour, closeHour, timezone } = await getSettings();

  const firstSlotStart = fromZonedTime(localWallClock(date, openHour), timezone);
  const lastSlotEnd = fromZonedTime(localWallClock(date, closeHour), timezone);

  // One query per day: fetch confirmed bookings that overlap the opening window.
  const bookedRanges = await prisma.booking.findMany({
    where: {
      roomId,
      status: 'CONFIRMED',
      startTime: { lt: lastSlotEnd },
      endTime: { gt: firstSlotStart },
    },
    select: { startTime: true, endTime: true },
  });

  const now = Date.now();
  const slots: AvailabilitySlot[] = [];

  for (let hour = openHour; hour < closeHour; hour += 1) {
    const start = fromZonedTime(localWallClock(date, hour), timezone);
    const end = fromZonedTime(localWallClock(date, hour + 1), timezone);

    const isBooked = bookedRanges.some(
      (booking) =>
        booking.startTime.getTime() < end.getTime() &&
        booking.endTime.getTime() > start.getTime(),
    );

    // A slot already started cannot be booked anymore (in-progress included).
    const isPast = start.getTime() <= now;

    const status: SlotStatus = isBooked ? 'BOOKED' : isPast ? 'PAST' : 'AVAILABLE';

    slots.push({
      hour,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      label: `${formatInTimeZone(start, timezone, 'HH:mm')} - ${formatInTimeZone(end, timezone, 'HH:mm')}`,
      status,
    });
  }

  return {
    room: {
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      pricePerHour: room.pricePerHour,
    },
    date,
    timezone,
    openHour,
    closeHour,
    slots,
  };
}
