import type { ScheduleRow } from '@/db/schema';
import { computeScheduleStatus, statusFromRatio } from './StatusService';

function makeSchedule(overrides: Partial<ScheduleRow>): ScheduleRow {
  return {
    id: 'sched-1',
    createdAt: 0,
    updatedAt: 0,
    deletedAt: null,
    motorcycleId: 'bike-1',
    componentType: 'engine_oil',
    customName: null,
    intervalKm: 1500,
    intervalMonths: null,
    isEnabled: 1,
    isMuted: 0,
    snoozedUntil: null,
    anchorOdometerKm: 20000,
    anchorDate: null,
    anchorSource: 'record',
    ...overrides,
  };
}

describe('statusFromRatio — BUSINESS_RULES.md §4 thresholds', () => {
  test.each([
    [0.79, 'good'],
    [0.8, 'dueSoon'],
    [0.99, 'dueSoon'],
    [1.0, 'overdue'],
    [1.5, 'overdue'],
  ])('r=%f → %s', (r, expected) => {
    expect(statusFromRatio(r)).toBe(expected);
  });
});

describe('computeScheduleStatus', () => {
  test('un-anchored schedule → neutral, no ratio', () => {
    const schedule = makeSchedule({ anchorOdometerKm: null, anchorDate: null, anchorSource: null });
    const status = computeScheduleStatus(schedule, 21000, '2026-07-06');
    expect(status.status).toBe('neutral');
    expect(status.ratio).toBeNull();
    expect(status.anchored).toBe(false);
  });

  test('disabled schedule → neutral even if anchored', () => {
    const schedule = makeSchedule({ isEnabled: 0 });
    const status = computeScheduleStatus(schedule, 21000, '2026-07-06');
    expect(status.status).toBe('neutral');
  });

  test('km-only interval at exactly 80% used → dueSoon (boundary belongs to top branch of s(r), but status is dueSoon at r=0.80)', () => {
    // anchor 20000, interval 1500 → due-soon starts at km_used = 1200 (r=0.8)
    const schedule = makeSchedule({ anchorOdometerKm: 20000, intervalKm: 1500 });
    const status = computeScheduleStatus(schedule, 21200, '2026-07-06');
    expect(status.ratio).toBeCloseTo(0.8, 5);
    expect(status.status).toBe('dueSoon');
    expect(status.governs).toBe('km');
  });

  test('overdue: km_used exceeds interval', () => {
    const schedule = makeSchedule({ anchorOdometerKm: 20000, intervalKm: 1500 });
    const status = computeScheduleStatus(schedule, 21600, '2026-07-06');
    expect(status.ratio).toBeCloseTo(1.0667, 3);
    expect(status.status).toBe('overdue');
    expect(status.remainingKm).toBeLessThan(0);
  });

  test('whichever dimension is nearer governs remaining display', () => {
    const schedule = makeSchedule({
      anchorOdometerKm: 20000,
      intervalKm: 1500,
      anchorDate: '2026-01-01',
      intervalMonths: 3,
    });
    // km_used=100 → r_km=0.067; days_used ~186 → interval_days ~91.3 → r_days ~2.0 (overdue by time)
    const status = computeScheduleStatus(schedule, 20100, '2026-07-06');
    expect(status.governs).toBe('days');
    expect(status.status).toBe('overdue');
  });
});
