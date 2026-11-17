import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/AppError.js';
import type { CreateRoomInput, UpdateRoomInput } from './room.schema.js';

export function listActiveRooms() {
  return prisma.room.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
}

// Admin view: includes deactivated rooms.
export function listAllRooms() {
  return prisma.room.findMany({ orderBy: { name: 'asc' } });
}

export async function getRoomById(id: string) {
  const room = await prisma.room.findUnique({ where: { id } });

  if (!room) {
    throw AppError.notFound('Room not found');
  }

  return room;
}

export async function createRoom(input: CreateRoomInput) {
  try {
    return await prisma.room.create({ data: input });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError(409, 'A room with this name already exists', 'ROOM_NAME_TAKEN');
    }
    throw error;
  }
}

export async function updateRoom(id: string, input: UpdateRoomInput) {
  await getRoomById(id);

  try {
    return await prisma.room.update({ where: { id }, data: input });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError(409, 'A room with this name already exists', 'ROOM_NAME_TAKEN');
    }
    throw error;
  }
}

// Soft delete: keeps existing bookings valid while hiding the room from users.
export async function deactivateRoom(id: string) {
  await getRoomById(id);

  return prisma.room.update({
    where: { id },
    data: { isActive: false },
  });
}
