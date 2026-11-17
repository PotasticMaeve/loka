import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';

export function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

// Builds a wall-clock time in the configured timezone,
// e.g. ("2026-11-18", 9) -> "2026-11-18T09:00:00".
// Hour 24 means midnight at the start of the next day.
export function localWallClock(date: string, hour: number): string {
  if (hour <= 23) {
    return `${date}T${pad2(hour)}:00:00`;
  }

  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return `${next.toISOString().slice(0, 10)}T00:00:00`;
}

// True when the instant lands exactly on a full hour in that timezone
// (handles zones whose UTC offset is not a whole hour).
export function isOnLocalHour(date: Date, timeZone: string): boolean {
  return formatInTimeZone(date, timeZone, 'mm:ss.SSS') === '00:00.000';
}

// UTC instants for "opening time" and "closing time" of one calendar day.
export function operatingWindow(
  date: string,
  timeZone: string,
  openHour: number,
  closeHour: number,
) {
  return {
    open: fromZonedTime(localWallClock(date, openHour), timeZone),
    close: fromZonedTime(localWallClock(date, closeHour), timeZone),
  };
}
