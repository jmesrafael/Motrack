/**
 * The Health Score — exact implementation of HEALTH_SCORE.md §3–§5.
 * Pure function, never persisted (ADR-019).
 */

import type { ScheduleRow } from '@/db/schema';
import { componentWeight } from '@/db/seed/defaults';
import type { HealthBandId } from '@/types/domain';
import type { ComponentType } from '@/types/enums';
import type { ScheduleStatus } from './StatusService';

export interface HealthScoreItem {
  scheduleId: string;
  componentType: ComponentType;
  customName: string | null;
  weight: number;
  ratio: number;
  itemScore: number;
}

export interface HealthScoreResult {
  /** null = no enabled anchored schedules → UI shows "—" + "Finish setup". */
  score: number | null;
  band: HealthBandId | null;
  items: HealthScoreItem[];
  enabledCount: number;
  anchoredCount: number;
  /** Anchored < 60% of enabled → show "partial" indicator (A-06). */
  isPartial: boolean;
}

/** Item score s(r) — HEALTH_SCORE.md §3; boundaries proven by the §7C vectors. */
export function itemScore(r: number): number {
  if (r <= 0.8) {
    return 100;
  }
  if (r <= 1.0) {
    return 100 - 150 * (r - 0.8);
  }
  return Math.max(0, 70 - 70 * (r - 1.0));
}

/** Round half away from zero (HEALTH_SCORE.md §5). */
function roundHalfAway(value: number): number {
  return Math.sign(value) * Math.round(Math.abs(value));
}

export function healthBand(score: number): HealthBandId {
  if (score >= 90) {
    return 'excellent';
  }
  if (score >= 75) {
    return 'good';
  }
  if (score >= 50) {
    return 'fair';
  }
  if (score >= 25) {
    return 'poor';
  }
  return 'critical';
}

const PARTIAL_THRESHOLD = 0.6;

/**
 * Weighted bike score over enabled, anchored schedules (statuses computed by
 * StatusService). Registration/insurance never enter — they are documents,
 * not schedules (BUSINESS_RULES.md §8.3 upheld structurally).
 */
export function computeHealthScore(
  schedules: readonly ScheduleRow[],
  statuses: ReadonlyMap<string, ScheduleStatus>,
): HealthScoreResult {
  const enabled = schedules.filter((s) => s.isEnabled === 1);
  const items: HealthScoreItem[] = [];

  for (const schedule of enabled) {
    const status = statuses.get(schedule.id);
    if (status === undefined || status.ratio === null) {
      continue;
    }
    items.push({
      scheduleId: schedule.id,
      componentType: schedule.componentType as ComponentType,
      customName: schedule.customName,
      weight: componentWeight(schedule.componentType as ComponentType),
      ratio: status.ratio,
      itemScore: itemScore(status.ratio),
    });
  }

  if (items.length === 0) {
    return {
      score: null,
      band: null,
      items,
      enabledCount: enabled.length,
      anchoredCount: 0,
      isPartial: false,
    };
  }

  const weightSum = items.reduce((sum, item) => sum + item.weight, 0);
  const weightedSum = items.reduce((sum, item) => sum + item.weight * item.itemScore, 0);
  const score = roundHalfAway(weightedSum / weightSum);

  return {
    score,
    band: healthBand(score),
    items,
    enabledCount: enabled.length,
    anchoredCount: items.length,
    isPartial: enabled.length > 0 && items.length / enabled.length < PARTIAL_THRESHOLD,
  };
}
