/**
 * The single formatting path (CODE_STYLE.md §6, LOCALIZATION.md §5).
 * Money is integer centavos everywhere (ADR-008); conversion happens here only.
 */

import { strings } from '@/i18n/strings';
import type { ComponentType, ExpenseCategory, OdometerSource } from '@/types/enums';

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

const monthYear = new Intl.DateTimeFormat('en-PH', { month: 'short', year: 'numeric' });

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

/** e.g. "Mar 2027" — Quick Log cards' date-governed "about" estimate (item 11). */
export function formatMonthYear(isoDate: string): string {
  return monthYear.format(new Date(`${isoDate}T00:00:00`));
}

export function formatFullDate(date: Date): string {
  return weekdayMonthDay.format(date);
}

/**
 * Last-resort fallback for any internal key that reaches the UI without a
 * dictionary entry (a value added to a DB CHECK/enum before its `strings.*`
 * label shipped, or legacy data from before a rename). Converts
 * snake_case/kebab-case/camelCase into "Title Case" so the user never sees a
 * raw identifier, e.g. `oil_change` -> "Oil Change", `componentKey_123` ->
 * "Component Key 123".
 */
export function humanizeKey(key: string): string {
  const spaced = key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim();
  if (spaced === '') {
    return spaced;
  }
  return spaced
    .split(' ')
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Component type -> display label, with a humanized fallback for unmapped/legacy values. */
export function formatComponentName(componentType: ComponentType | string, customName: string | null): string {
  if (componentType === 'custom') {
    return customName ?? strings.components.custom;
  }
  const label = (strings.components as Record<string, string>)[componentType];
  return label ?? humanizeKey(componentType);
}

/** Expense category -> display label, with a humanized fallback for unmapped/legacy values. */
export function formatCategoryName(category: ExpenseCategory | string): string {
  const label = (strings.categories as Record<string, string>)[category];
  return label ?? humanizeKey(category);
}

/** Document type -> display label, with a humanized fallback for unmapped/legacy values. */
export function formatDocTypeName(docType: string): string {
  const label = (strings.docTypes as Record<string, string>)[docType];
  return label ?? humanizeKey(docType);
}

/** Odometer reading source -> display label, with a humanized fallback for unmapped/legacy values. */
export function formatOdometerSource(source: OdometerSource | string): string {
  const label = (strings.sources.odometer as Record<string, string>)[source];
  return label ?? humanizeKey(source);
}

/**
 * Normalizes free-form text for duplicate comparison (SearchOrAdd, item 14):
 * trims, collapses repeated inner whitespace, and lowercases, so "Brake Pads",
 * "brake pads", and " Brake   Pads " all compare equal.
 */
export function normalizeForCompare(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}
