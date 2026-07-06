/**
 * The single formatting path (CODE_STYLE.md §6, LOCALIZATION.md §5).
 * Money is integer centavos everywhere (ADR-008); conversion happens here only.
 */

const peso = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const pesoWhole = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat('en-PH');

const monthDay = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric' });

const weekdayMonthDay = new Intl.DateTimeFormat('en-PH', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

export function formatMoney(centavos: number): string {
  return peso.format(centavos / 100);
}

/** For stat tiles where centavo precision is noise; exact values keep formatMoney. */
export function formatMoneyWhole(centavos: number): string {
  return pesoWhole.format(Math.round(centavos / 100));
}

export function formatKm(km: number): string {
  return `${number.format(km)} km`;
}

export function formatMonthDay(isoDate: string): string {
  return monthDay.format(new Date(isoDate));
}

export function formatFullDate(date: Date): string {
  return weekdayMonthDay.format(date);
}
