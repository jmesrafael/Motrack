import type { DocumentRow, ScheduleRow } from '@/db/schema';
import {
  computeDailyKmRate,
  DEFAULT_REMINDER_SETTINGS,
  type PlannerBike,
  type PlannerInput,
  planReminders,
  REMINDER_CAP_PER_BIKE,
  REMINDER_CAP_TOTAL,
} from './ReminderPlanner';

const NOW = new Date('2026-07-06T00:00:00').getTime(); // matches other suites' reference date

function makeBike(overrides: Partial<PlannerBike> = {}): PlannerBike {
  return { id: 'bike-1', nickname: 'Red Click', currentOdometerKm: 20000, isArchived: 0, ...overrides };
}

function makeSchedule(overrides: Partial<ScheduleRow> = {}): ScheduleRow {
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
    isPinned: 0,
    pinnedSortOrder: 0,
    sortOrder: 0,
    ...overrides,
  };
}

function makeDocument(overrides: Partial<DocumentRow> = {}): DocumentRow {
  return {
    id: 'doc-1',
    createdAt: 0,
    updatedAt: 0,
    deletedAt: null,
    motorcycleId: 'bike-1',
    docType: 'orcr',
    title: 'OR/CR',
    filePath: '/x',
    mimeType: 'image/jpeg',
    fileSize: 100,
    expiryDate: null,
    notes: null,
    documentNumber: null,
    link: null,
    extraFiles: null,
    ...overrides,
  };
}

function plan(input: Partial<PlannerInput>, now = NOW) {
  return planReminders(
    {
      bikes: [makeBike()],
      schedulesByBike: {},
      rateByBike: {},
      documents: [],
      settings: DEFAULT_REMINDER_SETTINGS,
      ...input,
    },
    now,
  );
}

describe('computeDailyKmRate — BUSINESS_RULES.md §7.5', () => {
  test('30d window with 2+ readings → high confidence', () => {
    const r = computeDailyKmRate(
      [{ effectiveKm: 20000 }, { effectiveKm: 20300 }],
      [],
    );
    expect(r.confidence).toBe('high');
    expect(r.rate).toBeCloseTo(10, 5); // 300/30
  });

  test('falls back to 90d window when 30d has < 2 readings', () => {
    const r = computeDailyKmRate([{ effectiveKm: 20000 }], [{ effectiveKm: 20000 }, { effectiveKm: 20900 }]);
    expect(r.confidence).toBe('low');
    expect(r.rate).toBeCloseTo(10, 5); // 900/90
  });

  test('defaults to 25 km/day when both windows are sparse', () => {
    const r = computeDailyKmRate([], []);
    expect(r).toEqual({ rate: 25, confidence: 'low' });
  });

  test('clamps to [5, 300]', () => {
    expect(computeDailyKmRate([{ effectiveKm: 0 }, { effectiveKm: 1 }], []).rate).toBe(5);
    expect(computeDailyKmRate([{ effectiveKm: 0 }, { effectiveKm: 100000 }], []).rate).toBe(300);
  });
});

describe('planReminders — km-based due soon (§4)', () => {
  test('outside the 3-day lead window → nothing planned yet', () => {
    // rate 100 km/day, remaining 1000 km → 10 days out, lead window is 3 days
    const schedule = makeSchedule({ anchorOdometerKm: 19000, intervalKm: 2000 }); // used 1000, remaining 1000
    const entries = plan({
      schedulesByBike: { 'bike-1': [schedule] },
      rateByBike: { 'bike-1': { rate: 100, confidence: 'high' } },
    });
    expect(entries).toHaveLength(0);
  });

  test('inside the 3-day lead window → plans the -3-day and due-date entries', () => {
    // anchor 18800, interval 1500, current 20000 → used 1200, remaining 300; at 100 km/day → due in 3 days
    const schedule = makeSchedule({ anchorOdometerKm: 18800, intervalKm: 1500 });
    const entries = plan({
      schedulesByBike: { 'bike-1': [schedule] },
      rateByBike: { 'bike-1': { rate: 100, confidence: 'high' } },
    });
    expect(entries).toHaveLength(2);
    expect(entries.every((e) => e.notificationType === 'maintenance_due')).toBe(true);
    expect(entries.map((e) => e.fireDateIso).sort()).toEqual(['2026-07-06', '2026-07-09']);
  });

  test('low-confidence rate is surfaced on the entry', () => {
    const schedule = makeSchedule({ anchorOdometerKm: 18800, intervalKm: 1500 });
    const entries = plan({
      schedulesByBike: { 'bike-1': [schedule] },
      rateByBike: { 'bike-1': { rate: 100, confidence: 'low' } },
    });
    expect(entries[0]?.data.lowConfidence).toBe(true);
  });
});

describe('planReminders — time-based due soon (§3)', () => {
  test('outside the 7-day lead window → nothing planned', () => {
    const schedule = makeSchedule({
      componentType: 'coolant',
      intervalKm: null,
      intervalMonths: 12,
      anchorOdometerKm: null,
      anchorDate: '2025-08-01', // due 2026-08-01ish, well past 7 days out from 2026-07-06
    });
    const entries = plan({ schedulesByBike: { 'bike-1': [schedule] } });
    expect(entries).toHaveLength(0);
  });

  test('inside the 7-day lead window → plans -7-day and due-date entries', () => {
    // interval_days = round(1 * 30.44) = 30; anchor 2026-06-06 → due 2026-07-06 (today)
    const schedule = makeSchedule({
      componentType: 'coolant',
      intervalKm: null,
      intervalMonths: 1,
      anchorOdometerKm: null,
      anchorDate: '2026-06-06',
    });
    const entries = plan({ schedulesByBike: { 'bike-1': [schedule] } });
    // due date is today → this is the r>=1.00 boundary, so it's classified overdue (day 0), not due-soon.
    expect(entries.every((e) => e.notificationType === 'maintenance_overdue')).toBe(true);
  });
});

describe('planReminders — overdue nags (§6)', () => {
  test('plans up to 3 weekly occurrences from the due date, silent once all have passed', () => {
    // due date was 20 days ago (well past 3 nags at +0/+7/+14)
    const schedule = makeSchedule({ anchorOdometerKm: 18000, intervalKm: 1500 }); // due at 19500; bike at 20000 → 500 over
    const entries = plan({
      schedulesByBike: { 'bike-1': [schedule] },
      rateByBike: { 'bike-1': { rate: 25, confidence: 'high' } }, // 500km / 25 = 20 days overdue
    });
    expect(entries).toHaveLength(0); // all 3 occurrences (day 0, 7, 14) are in the past
  });

  test('recently overdue → remaining future occurrences only', () => {
    // anchor 18450, interval 1500, current 20000 → 50 km over → 2 days overdue at 25 km/day.
    // Occurrences at due-2, due+5, due+12 relative to today; only the future two survive.
    const schedule = makeSchedule({ anchorOdometerKm: 18450, intervalKm: 1500 });
    const entries = plan({
      schedulesByBike: { 'bike-1': [schedule] },
      rateByBike: { 'bike-1': { rate: 25, confidence: 'high' } },
    });
    expect(entries.every((e) => e.notificationType === 'maintenance_overdue')).toBe(true);
    expect(entries.map((e) => e.fireDateIso).sort()).toEqual(['2026-07-11', '2026-07-18']);
  });

  test('due exactly today (ratio boundary = 1.00) is the first overdue occurrence', () => {
    const schedule = makeSchedule({ anchorOdometerKm: 18500, intervalKm: 1500 }); // due at 20000 == current
    const entries = plan({
      schedulesByBike: { 'bike-1': [schedule] },
      rateByBike: { 'bike-1': { rate: 25, confidence: 'high' } },
    });
    expect(entries.map((e) => e.fireDateIso).sort()).toEqual(['2026-07-06', '2026-07-13', '2026-07-20']);
  });
});

describe('planReminders — schedule filters', () => {
  test('disabled schedule is skipped entirely', () => {
    const schedule = makeSchedule({ isEnabled: 0, anchorOdometerKm: 18500, intervalKm: 1500 });
    expect(plan({ schedulesByBike: { 'bike-1': [schedule] } })).toHaveLength(0);
  });

  test('muted schedule is skipped entirely', () => {
    const schedule = makeSchedule({ isMuted: 1, anchorOdometerKm: 18500, intervalKm: 1500 });
    expect(plan({ schedulesByBike: { 'bike-1': [schedule] } })).toHaveLength(0);
  });

  test('snoozed schedule (until a future date) is skipped', () => {
    const schedule = makeSchedule({ snoozedUntil: '2026-07-20', anchorOdometerKm: 18500, intervalKm: 1500 });
    expect(plan({ schedulesByBike: { 'bike-1': [schedule] } })).toHaveLength(0);
  });

  test('un-anchored schedule is skipped (no due dimension to project)', () => {
    const schedule = makeSchedule({ anchorOdometerKm: null, anchorDate: null, anchorSource: null });
    expect(plan({ schedulesByBike: { 'bike-1': [schedule] } })).toHaveLength(0);
  });

  test('archived bike contributes no entries', () => {
    const schedule = makeSchedule({ anchorOdometerKm: 18500, intervalKm: 1500 });
    const entries = plan({
      bikes: [makeBike({ isArchived: 1 })],
      schedulesByBike: { 'bike-1': [schedule] },
    });
    expect(entries).toHaveLength(0);
  });

  test('disabling the maintenance_overdue pref suppresses overdue entries', () => {
    const schedule = makeSchedule({ anchorOdometerKm: 18500, intervalKm: 1500 });
    const entries = plan({
      schedulesByBike: { 'bike-1': [schedule] },
      settings: { ...DEFAULT_REMINDER_SETTINGS, prefs: { ...DEFAULT_REMINDER_SETTINGS.prefs, maintenance_overdue: false } },
    });
    expect(entries).toHaveLength(0);
  });
});

describe('planReminders — document expiry (§7)', () => {
  test('30/7/1-day lead entries for a future expiry', () => {
    const doc = makeDocument({ expiryDate: '2026-08-05' }); // 30 days out from 2026-07-06
    const entries = plan({ documents: [doc] });
    expect(entries.map((e) => e.fireDateIso).sort()).toEqual(['2026-07-06', '2026-07-29', '2026-08-04']);
    expect(entries.every((e) => e.notificationType === 'document_expiry')).toBe(true);
  });

  test('non-expiry doc type produces no entries', () => {
    const doc = makeDocument({ docType: 'receipt', expiryDate: '2026-08-05' });
    expect(plan({ documents: [doc] })).toHaveLength(0);
  });

  test('already-expired document produces no entries (one-off case is deferred)', () => {
    const doc = makeDocument({ expiryDate: '2026-01-01' });
    expect(plan({ documents: [doc] })).toHaveLength(0);
  });
});

describe('planReminders — quiet hours (§6)', () => {
  test('a fire time inside quiet hours shifts to 08:00', () => {
    const schedule = makeSchedule({ anchorOdometerKm: 18500, intervalKm: 1500 });
    const entries = plan({
      schedulesByBike: { 'bike-1': [schedule] },
      settings: { ...DEFAULT_REMINDER_SETTINGS, fireTime: '22:00' }, // inside default 21:00–07:00 quiet window
    });
    const fired = new Date(entries[0]!.fireAtMs);
    expect(fired.getHours()).toBe(8);
    expect(fired.getMinutes()).toBe(0);
  });

  test('a fire time outside quiet hours is used as-is', () => {
    const schedule = makeSchedule({ anchorOdometerKm: 18500, intervalKm: 1500 });
    const entries = plan({
      schedulesByBike: { 'bike-1': [schedule] },
      settings: { ...DEFAULT_REMINDER_SETTINGS, fireTime: '10:00' },
    });
    const fired = new Date(entries[0]!.fireAtMs);
    expect(fired.getHours()).toBe(10);
  });

  test('quiet hours disabled (null) never shifts the fire time', () => {
    const schedule = makeSchedule({ anchorOdometerKm: 18500, intervalKm: 1500 });
    const entries = plan({
      schedulesByBike: { 'bike-1': [schedule] },
      settings: { ...DEFAULT_REMINDER_SETTINGS, fireTime: '22:00', quietHours: null },
    });
    const fired = new Date(entries[0]!.fireAtMs);
    expect(fired.getHours()).toBe(22);
  });
});

describe('planReminders — caps and priority (§5.3)', () => {
  test('caps at 12 pending per bike, keeping nearest-date-first within priority', () => {
    // 20 independent overdue schedules on the same bike, each producing 1 future occurrence.
    const schedules = Array.from({ length: 20 }, (_, i) =>
      makeSchedule({
        id: `sched-${i}`,
        anchorOdometerKm: 18500 - i, // slightly different due dates → distinct fire dates
        intervalKm: 1500,
      }),
    );
    const entries = plan({
      schedulesByBike: { 'bike-1': schedules },
      rateByBike: { 'bike-1': { rate: 25, confidence: 'high' } },
    });
    expect(entries.length).toBeLessThanOrEqual(REMINDER_CAP_PER_BIKE);
  });

  test('caps at 48 total across many bikes', () => {
    const bikes = Array.from({ length: 6 }, (_, i) => makeBike({ id: `bike-${i}`, nickname: `Bike ${i}` }));
    const schedulesByBike: Record<string, ScheduleRow[]> = {};
    for (const bike of bikes) {
      schedulesByBike[bike.id] = Array.from({ length: 15 }, (_, i) =>
        makeSchedule({ id: `${bike.id}-sched-${i}`, motorcycleId: bike.id, anchorOdometerKm: 18500 - i, intervalKm: 1500 }),
      );
    }
    const rateByBike = Object.fromEntries(bikes.map((b) => [b.id, { rate: 25, confidence: 'high' as const }]));
    const entries = plan({ bikes, schedulesByBike, rateByBike });
    expect(entries.length).toBeLessThanOrEqual(REMINDER_CAP_TOTAL);
  });

  test('overdue entries outrank due-soon entries under the cap', () => {
    const overdue = makeSchedule({ id: 'overdue', anchorOdometerKm: 18500, intervalKm: 1500 });
    const dueSoon = makeSchedule({ id: 'due-soon', anchorOdometerKm: 18800, intervalKm: 1500 });
    const entries = plan({
      schedulesByBike: { 'bike-1': [overdue, dueSoon] },
      rateByBike: { 'bike-1': { rate: 100, confidence: 'high' } },
    });
    const types = entries.map((e) => e.notificationType);
    expect(types).toContain('maintenance_overdue');
    expect(types).toContain('maintenance_due');
  });
});
