import { useMemo } from 'react';

import { strings } from '@/i18n/strings';
import { formatFullDate } from '@/lib/format';
import { dashboardFixture } from '@/testing/fixtures/dashboard';
import type { DashboardData, HealthBandId } from '@/types/domain';

export interface DashboardVm {
  data: DashboardData;
  greeting: string;
  dateLabel: string;
  bandId: HealthBandId;
  bandLabel: string;
  /** Due-soon + overdue count feeding the reminders badge. */
  attentionCount: number;
}

/** Display bands per HEALTH_SCORE.md §6 — display mapping only, no scoring logic. */
function healthBandId(score: number): HealthBandId {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 50) return 'fair';
  if (score >= 25) return 'poor';
  return 'critical';
}

/**
 * Validation phase: view model over the fixture. The real hook reads Zustand
 * view state fed by services/repositories (DATA_FLOW.md §3) — same shape.
 */
export function useDashboardData(): DashboardVm {
  return useMemo(() => {
    const data = dashboardFixture;
    const hour = new Date().getHours();
    const greeting =
      hour < 12
        ? strings.dashboard.greeting.morning
        : hour < 18
          ? strings.dashboard.greeting.afternoon
          : strings.dashboard.greeting.evening;
    const bandId = healthBandId(data.healthScore);
    return {
      data,
      greeting,
      dateLabel: formatFullDate(new Date()),
      bandId,
      bandLabel: strings.dashboard.band[bandId],
      attentionCount: data.upcoming.filter((s) => s.status === 'dueSoon' || s.status === 'overdue')
        .length,
    };
  }, []);
}
