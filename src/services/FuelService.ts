/**
 * Fuel mathematics — the single implementation of BUSINESS_RULES.md §7.
 * Pure functions over chronological fuel rows + odometer windows.
 */

import type { FuelLogRow, OdometerLogRow } from '@/db/schema';
import { addDays, daysBetween } from '@/lib/dates';

/** Spans with km ≤ 0 or km > 2,000 are excluded as implausible (A-07). */
const MAX_PLAUSIBLE_SPAN_KM = 2000;

export interface ConsumptionSpan {
  /** id of the closing full-tank fill. */
  fillId: string;
  km: number;
  liters: number;
  kmPerLiter: number;
}

/**
 * Full-to-full consumption spans (§7.2): km between consecutive full-tank
 * fills; liters = every fill after span start up to and including span end.
 * Input must be chronological (fuel_date asc). Odometer values are effective km
 * — fuel rows store the entered reading; effective conversion happens at save
 * (offset applies per row; see OdometerService).
 */
export function computeSpans(chronological: readonly FuelLogRow[]): ConsumptionSpan[] {
  const spans: ConsumptionSpan[] = [];
  let spanStart: FuelLogRow | null = null;
  let litersSinceStart = 0;

  for (const fill of chronological) {
    if (spanStart !== null) {
      litersSinceStart += fill.liters;
      if (fill.isFullTank === 1) {
        const km = fill.odometerKm - spanStart.odometerKm;
        if (km > 0 && km <= MAX_PLAUSIBLE_SPAN_KM && litersSinceStart > 0) {
          spans.push({
            fillId: fill.id,
            km,
            liters: litersSinceStart,
            kmPerLiter: km / litersSinceStart,
          });
        }
      }
    }
    if (fill.isFullTank === 1) {
      spanStart = fill;
      litersSinceStart = 0;
    }
  }
  return spans;
}

/** Displayed km/L = mean of the last 5 valid spans (§7.3); null with no spans. */
export function averageKmPerLiter(spans: readonly ConsumptionSpan[]): number | null {
  const recent = spans.slice(-5);
  if (recent.length === 0) {
    return null;
  }
  return recent.reduce((sum, s) => sum + s.kmPerLiter, 0) / recent.length;
}

/**
 * Fuel cost/km (§7.3): Σ fuel cost / km over trailing 90 days when ≥ 2 odometer
 * readings exist there; otherwise lifetime; otherwise null ("—").
 */
export function fuelCostPerKm(
  fills: readonly FuelLogRow[],
  todayIso: string,
): number | null {
  const from = addDays(todayIso, -90);
  const windowFills = fills.filter((f) => f.fuelDate >= from);
  const chosen = windowFills.length >= 2 ? windowFills : fills;
  if (chosen.length < 2) {
    return null;
  }
  const odos = chosen.map((f) => f.odometerKm);
  const km = Math.max(...odos) - Math.min(...odos);
  if (km <= 0) {
    return null;
  }
  const cost = chosen.reduce((sum, f) => sum + f.totalCostCentavos, 0);
  return cost / km;
}

const DEFAULT_DAILY_KM = 25;
const DAILY_KM_MIN = 5;
const DAILY_KM_MAX = 300;

export interface DailyKmRate {
  kmPerDay: number;
  /** 'low' when the 90-day fallback or default was used (§7.5) — copy says "around". */
  confidence: 'normal' | 'low';
}

/**
 * Daily-km rate (§7.5): (max effective − min effective) / days over trailing
 * 30 days of odometer logs; < 2 readings → widen to 90; still < 2 → 25 km/day.
 * Clamped to [5, 300].
 */
export function dailyKmRate(
  logsInWindow: (fromIso: string) => readonly OdometerLogRow[],
  todayIso: string,
): DailyKmRate {
  for (const { days, confidence } of [
    { days: 30, confidence: 'normal' as const },
    { days: 90, confidence: 'low' as const },
  ]) {
    const logs = logsInWindow(addDays(todayIso, -days));
    if (logs.length >= 2) {
      const kms = logs.map((l) => l.effectiveKm);
      const dates = logs.map((l) => l.recordedDate);
      const spanKm = Math.max(...kms) - Math.min(...kms);
      const spanDays = Math.max(
        1,
        daysBetween(dates.reduce((a, b) => (a < b ? a : b)), dates.reduce((a, b) => (a > b ? a : b))),
      );
      const rate = spanKm / spanDays;
      return { kmPerDay: clampRate(rate), confidence };
    }
  }
  return { kmPerDay: DEFAULT_DAILY_KM, confidence: 'low' };
}

function clampRate(rate: number): number {
  return Math.min(DAILY_KM_MAX, Math.max(DAILY_KM_MIN, rate));
}

/** Quick Log odometer projection: current + rate × days since last reading, rounded to 10 km. */
export function projectOdometer(
  currentEffective: number,
  lastReadingDate: string | null,
  rate: DailyKmRate,
  todayIso: string,
): number {
  if (lastReadingDate === null) {
    return currentEffective;
  }
  const days = Math.max(0, daysBetween(lastReadingDate, todayIso));
  return Math.round((currentEffective + rate.kmPerDay * days) / 10) * 10;
}
