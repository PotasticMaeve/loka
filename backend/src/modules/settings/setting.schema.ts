import { z } from 'zod';

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

export const updateSettingSchema = z
  .object({
    openHour: z.number().int().min(0).max(23),
    closeHour: z.number().int().min(1).max(24),
    timezone: z.string().refine(isValidTimeZone, 'Invalid IANA timezone'),
  })
  .refine((data) => data.closeHour > data.openHour, {
    message: 'closeHour must be greater than openHour',
    path: ['closeHour'],
  });

export type UpdateSettingInput = z.infer<typeof updateSettingSchema>;
