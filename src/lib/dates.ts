/**
 * Date math lives here only (CODE_STYLE.md §6). Calendar dates are TEXT
 * 'YYYY-MM-DD' in local time; timestamps are ms epoch (DATABASE_DESIGN.md §3).
 */

const DAY_MS = 86_400_000;

/** Days per month for interval math — deterministic across platforms (BUSINESS_RULES.md §10). */
const DAYS_PER_MONTH = 30.44;

export function nowMs(): number {
  return Date.now();
}

/** Local calendar date as 'YYYY-MM-DD'. */
export function todayIso(): string {
  return toIsoDate(new Date());
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parses 'YYYY-MM-DD' as local midnight (never UTC — avoids off-by-one days). */
export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

/** Whole days from `fromIso` to `toIso` (positive when toIso is later). */
export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((parseIsoDate(toIso).getTime() - parseIsoDate(fromIso).getTime()) / DAY_MS);
}

export function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

/** interval_days = round(interval_months × 30.44) — BUSINESS_RULES.md §4. */
export function intervalDaysFromMonths(months: number): number {
  return Math.round(months * DAYS_PER_MONTH);
}

/** 'YYYY-MM' month key of an ISO date. */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

/** First day of the month containing `iso`. */
export function monthStart(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

/** Shifts a 'YYYY-MM' key by n months (n may be negative). */
export function shiftMonthKey(key: string, n: number): string {
  const [y, m] = key.split('-').map(Number);
  const date = new Date(y ?? 1970, (m ?? 1) - 1 + n, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function isFutureDate(iso: string): boolean {
  return iso > todayIso();
}
