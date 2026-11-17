import { z } from 'zod';

// Rejects impossible dates such as 2026-02-30 (which JS would silently roll
// over to March 2nd) by checking the round-trip back to YYYY-MM-DD.
function isRealCalendarDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export const availabilityQuerySchema = z.object({
  date: z.string().superRefine((value, ctx) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      ctx.addIssue({ code: 'custom', message: 'date must use the YYYY-MM-DD format' });
      return;
    }

    if (!isRealCalendarDate(value)) {
      ctx.addIssue({ code: 'custom', message: 'date is not a valid calendar date' });
    }
  }),
});

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
