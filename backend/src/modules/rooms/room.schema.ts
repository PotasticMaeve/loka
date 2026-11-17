import { z } from 'zod';

const roomFields = {
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  capacity: z.number().int().positive('Capacity must be greater than 0').max(1000),
  pricePerHour: z.number().int().nonnegative('Price cannot be negative'),
  facilities: z.array(z.string().trim().min(1).max(50)).max(20),
  isActive: z.boolean(),
};

export const createRoomSchema = z.object({
  name: roomFields.name,
  capacity: roomFields.capacity,
  pricePerHour: roomFields.pricePerHour,
  facilities: roomFields.facilities.default([]),
  isActive: roomFields.isActive.optional(),
});

export const updateRoomSchema = z
  .object(roomFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const roomIdSchema = z.object({
  id: z.string().min(1, 'Room id is required'),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
