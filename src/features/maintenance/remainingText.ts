import { formatKm } from '@/lib/format';
import type { ScheduleStatus } from '@/services/StatusService';

/** "in X km" / "in Y days" / "overdue by X" — whichever dimension governs (BUSINESS_RULES.md §4). */
export function formatRemaining(status: ScheduleStatus): string {
  if (status.governs === null) {
    return 'Not set up';
  }
  if (status.governs === 'km' && status.remainingKm !== null) {
    return status.remainingKm >= 0
      ? `in ${formatKm(status.remainingKm)}`
      : `overdue by ${formatKm(Math.abs(status.remainingKm))}`;
  }
  if (status.governs === 'days' && status.remainingDays !== null) {
    const days = status.remainingDays;
    return days >= 0 ? `in ${days} day${days === 1 ? '' : 's'}` : `overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`;
  }
  return 'Not set up';
}
