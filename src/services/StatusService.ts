/**
 * Due ratios & status per schedule — the single implementation of
 * BUSINESS_RULES.md §4. Pure: takes rows + today, returns statuses.
 */

import type { ScheduleRow } from '@/db/schema';
import { daysBetween, intervalDaysFromMonths } from '@/lib/dates';
import type { DueStatus } from '@/types/domain';

export interface ScheduleStatus {
  scheduleId: string;
  status: DueStatus;
  /** max(km_used/interval_km, days_used/interval_days); null when un-anchored. */
  ratio: number | null;
  /** Remaining in the dimension that expires first; null when not applicable. */
  remainingKm: number | null;
  remainingDays: number | null;
  /** Which dimension governs the "remaining" display ('km' | 'days'). */
  governs: 'km' | 'days' | null;
  anchored: boolean;
}

export const DUE_SOON_THRESHOLD = 0.8;

export function statusFromRatio(ratio: number): DueStatus {
  if (ratio >= 1) {
    return 'overdue';
  }
  if (ratio >= DUE_SOON_THRESHOLD) {
    return 'dueSoon';
  }
  return 'good';
}

/**
 * Computes the due status of one enabled schedule. Un-anchored (or disabled)
 * schedules get status 'neutral' with null ratio — excluded from Health Score.
 */
export function computeScheduleStatus(
  schedule: ScheduleRow,
  currentEffectiveOdo: number,
  todayIso: string,
): ScheduleStatus {
  const anchored =
    schedule.anchorSource !== null &&
    (schedule.anchorOdometerKm !== null || schedule.anchorDate !== null);

  if (schedule.isEnabled !== 1 || !anchored) {
    return {
      scheduleId: schedule.id,
      status: 'neutral',
      ratio: null,
      remainingKm: null,
      remainingDays: null,
      governs: null,
      anchored,
    };
  }

  let kmFraction: number | null = null;
  let remainingKm: number | null = null;
  if (schedule.intervalKm !== null && schedule.anchorOdometerKm !== null) {
    const kmUsed = currentEffectiveOdo - schedule.anchorOdometerKm;
    kmFraction = kmUsed / schedule.intervalKm;
    remainingKm = schedule.intervalKm - kmUsed;
  }

  let daysFraction: number | null = null;
  let remainingDays: number | null = null;
  if (schedule.intervalMonths !== null && schedule.anchorDate !== null) {
    const intervalDays = intervalDaysFromMonths(schedule.intervalMonths);
    const daysUsed = daysBetween(schedule.anchorDate, todayIso);
    daysFraction = daysUsed / intervalDays;
    remainingDays = intervalDays - daysUsed;
  }

  const fractions = [kmFraction, daysFraction].filter((f): f is number => f !== null);
  if (fractions.length === 0) {
    // Anchored but the anchor lacks the dimension the interval needs (e.g. km
    // interval with date-only baseline) — honest unknown, not assumed OK.
    return {
      scheduleId: schedule.id,
      status: 'neutral',
      ratio: null,
      remainingKm: null,
      remainingDays: null,
      governs: null,
      anchored,
    };
  }

  const ratio = Math.max(...fractions);
  // The dimension nearer to expiring governs the remaining display (§4).
  const governs: 'km' | 'days' =
    kmFraction !== null && (daysFraction === null || kmFraction >= daysFraction) ? 'km' : 'days';

  return {
    scheduleId: schedule.id,
    status: statusFromRatio(ratio),
    ratio,
    remainingKm,
    remainingDays,
    governs,
    anchored,
  };
}
