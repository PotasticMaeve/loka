const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

// Renders an ISO timestamp in the operating timezone, e.g. "18 Nov 2026, 09:00".
export function formatInZone(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

// Time only, e.g. "09:00" — used where the date is already shown next to it.
export function formatTimeInZone(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso))
}

// Day only, e.g. "Tue, 18 Nov".
export function formatDayInZone(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(iso))
}

// "YYYY-MM-DD" for the browser's local date, used as the date input default.
export function todayInputValue(): string {
  return toDateInput(new Date())
}

// "YYYY-MM-DD" in the browser's local timezone (not UTC).
export function toDateInput(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function formatDuration(hours: number): string {
  return `${hours} hour${hours === 1 ? '' : 's'}`
}
