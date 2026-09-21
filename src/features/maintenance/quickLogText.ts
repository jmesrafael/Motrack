import { addDays, todayIso } from '@/lib/dates';
import { formatKm, formatMonthYear } from '@/lib/format';
import type { ScheduleStatus } from '@/services/StatusService';

/**
 * Quick Log card "next due" line (item 11): "About 1,200 km left" or
 * "About Mar 2027", whichever dimension governs (ScheduleStatus already
 * picks the one nearer to expiring — BUSINESS_RULES.md §4). Always prefixed
 * with "About" since these are estimates from the last logged odometer/date,
 * not a guarantee.
 */
export function formatQuickLogDue(status: ScheduleStatus): string {
  if (status.governs === 'km' && status.remainingKm !== null) {
    return status.remainingKm >= 0
      ? `About ${formatKm(status.remainingKm)} left`
      : `About ${formatKm(Math.abs(status.remainingKm))} overdue`;
  }
  if (status.governs === 'days' && status.remainingDays !== null) {
    const dueIso = addDays(todayIso(), status.remainingDays);
    return status.remainingDays >= 0
      ? `About ${formatMonthYear(dueIso)}`
      : `Overdue since about ${formatMonthYear(dueIso)}`;
  }
  return 'Not set up yet';
}
