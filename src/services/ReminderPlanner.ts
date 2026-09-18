/**
 * ReminderPlanner — pure planning function per NOTIFICATION_ENGINE.md.
 * `planReminders(input, nowMs) → PlanEntry[]` takes already-fetched rows and
 * settings, and returns the full desired notification plan. No DB, no
 * expo-notifications: fully unit-testable (NOTIFICATION_ENGINE.md §5).
 * `NotificationScheduler` gathers the input and executes the plan against the OS.
 *
 * Scope note: `backup_reminder` entries are not generated yet — the backup
 * feature (M8, BackupService) doesn't exist, so there is no `last_backup_at`
 * to reason about (see docs/PROGRESS.md). The "already expired at save time,
 * one immediate notification" edge case (§7) is also deferred — it requires
 * persisted "already notified" state this pure planner intentionally doesn't
 * carry; only the 30/7/1-day lead-time reminders for not-yet-expired
 * documents are implemented.
 */

import type { DocumentRow, ScheduleRow } from '@/db/schema';
import { addDays, daysBetween, intervalDaysFromMonths, parseIsoDate, toIsoDate } from '@/lib/dates';
import { type DocType, EXPIRY_DOC_TYPES } from '@/types/enums';

export type NotificationType = 'maintenance_due' | 'maintenance_overdue' | 'document_expiry' | 'backup_reminder';

export const REMINDER_CAP_PER_BIKE = 12;
export const REMINDER_CAP_TOTAL = 48;
export const OVERDUE_NAG_MAX = 3;
export const OVERDUE_NAG_INTERVAL_DAYS = 7;
export const KM_LEAD_DAYS = 3;
export const TIME_LEAD_DAYS = 7;
export const DEFAULT_DAILY_KM_RATE = 25;
export const MIN_DAILY_KM_RATE = 5;
export const MAX_DAILY_KM_RATE = 300;

export interface DailyRateResult {
  rate: number;
  confidence: 'high' | 'low';
}

/** BUSINESS_RULES.md §7.5. Windows are pre-fetched by the caller; this stays pure. */
export function computeDailyKmRate(
  logs30d: readonly { effectiveKm: number }[],
  logs90d: readonly { effectiveKm: number }[],
): DailyRateResult {
  const fromWindow = (logs: readonly { effectiveKm: number }[], days: number): number | null => {
    if (logs.length < 2 || days <= 0) {
      return null;
    }
    const km = logs.map((l) => l.effectiveKm);
    return (Math.max(...km) - Math.min(...km)) / days;
  };
  const clamp = (rate: number): number => Math.min(MAX_DAILY_KM_RATE, Math.max(MIN_DAILY_KM_RATE, rate));

  const r30 = fromWindow(logs30d, 30);
  if (r30 !== null) {
    return { rate: clamp(r30), confidence: 'high' };
  }
  const r90 = fromWindow(logs90d, 90);
  if (r90 !== null) {
    return { rate: clamp(r90), confidence: 'low' };
  }
  return { rate: DEFAULT_DAILY_KM_RATE, confidence: 'low' };
}

export interface QuietHours {
  /** 'HH:MM' local, 24h. */
  start: string;
  end: string;
}

export interface NotificationPrefs {
  maintenance_due: boolean;
  maintenance_overdue: boolean;
  document_expiry: boolean;
  backup_reminder: boolean;
}

export interface ReminderSettings {
  /** 'HH:MM' local, 24h — default fire time for all reminder types (§3). */
  fireTime: string;
  /** null disables quiet-hours shifting entirely. */
  quietHours: QuietHours | null;
  prefs: NotificationPrefs;
}

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  fireTime: '08:00',
  quietHours: { start: '21:00', end: '07:00' },
  prefs: {
    maintenance_due: true,
    maintenance_overdue: true,
    document_expiry: true,
    backup_reminder: true,
  },
};

export interface PlanEntry {
  /** Stable dedup/persistence key: `${sourceType}:${sourceId}:${notificationType}:${fireDateIso}`. */
  key: string;
  sourceType: 'schedule' | 'document';
  sourceId: string;
  bikeId: string | null;
  notificationType: NotificationType;
  fireAtMs: number;
  fireDateIso: string;
  data: {
    bikeNickname: string | null;
    componentType?: string;
    customName?: string | null;
    /** Which dimension the due projection is governed by (copy layer needs this to phrase km vs. days). */
    governs?: 'km' | 'days';
    remainingKm?: number | null;
    remainingDays?: number | null;
    lowConfidence?: boolean;
    docType?: DocType;
    docTitle?: string;
  };
}

export interface PlannerBike {
  id: string;
  nickname: string;
  currentOdometerKm: number;
  isArchived: number;
}

export interface PlannerInput {
  bikes: readonly PlannerBike[];
  /** Enabled/disabled/muted schedules for each bike — filtering happens inside the planner. */
  schedulesByBike: Readonly<Record<string, readonly ScheduleRow[]>>;
  /** Daily-km rate per bike (computeDailyKmRate output); missing entries fall back to the default. */
  rateByBike: Readonly<Record<string, DailyRateResult>>;
  documents: readonly DocumentRow[];
  settings: ReminderSettings;
}

interface DueProjection {
  dueDateIso: string;
  governs: 'km' | 'days';
  lowConfidence: boolean;
  remainingKm: number | null;
  remainingDays: number | null;
}

function projectDue(
  schedule: ScheduleRow,
  currentOdometerKm: number,
  todayIso: string,
  rateInfo: DailyRateResult,
): DueProjection | null {
  let kmDue: { dateIso: string; remainingKm: number } | null = null;
  if (schedule.intervalKm !== null && schedule.anchorOdometerKm !== null) {
    const remainingKm = schedule.intervalKm - (currentOdometerKm - schedule.anchorOdometerKm);
    const days = Math.ceil(remainingKm / rateInfo.rate);
    kmDue = { dateIso: addDays(todayIso, days), remainingKm };
  }

  let timeDue: { dateIso: string; remainingDays: number } | null = null;
  if (schedule.intervalMonths !== null && schedule.anchorDate !== null) {
    const dueDateIso = addDays(schedule.anchorDate, intervalDaysFromMonths(schedule.intervalMonths));
    timeDue = { dateIso: dueDateIso, remainingDays: daysBetween(todayIso, dueDateIso) };
  }

  if (kmDue === null && timeDue === null) {
    return null;
  }
  if (kmDue !== null && (timeDue === null || kmDue.dateIso <= timeDue.dateIso)) {
    return {
      dueDateIso: kmDue.dateIso,
      governs: 'km',
      lowConfidence: rateInfo.confidence === 'low',
      remainingKm: kmDue.remainingKm,
      remainingDays: timeDue?.remainingDays ?? null,
    };
  }
  return {
    dueDateIso: timeDue!.dateIso,
    governs: 'days',
    lowConfidence: false,
    remainingKm: kmDue?.remainingKm ?? null,
    remainingDays: timeDue!.remainingDays,
  };
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function isWithinQuietHours(time: string, quietHours: QuietHours): boolean {
  const t = timeToMinutes(time);
  const s = timeToMinutes(quietHours.start);
  const e = timeToMinutes(quietHours.end);
  if (s === e) {
    return false;
  }
  return s < e ? t >= s && t < e : t >= s || t < e;
}

/**
 * NOTIFICATION_ENGINE.md §6: a fire time inside quiet hours moves to 08:00.
 * Implementation note: the spec's literal "(or user fire time if later)" is
 * ambiguous when the user's own fire time is what caused the conflict in the
 * first place — read literally it can resolve back to a time still inside
 * quiet hours. We instead guarantee the shifted time never lands in quiet
 * hours: prefer 08:00, and only fall back further (to the end of the quiet
 * window) if even 08:00 is inside a customized window.
 */
function effectiveFireTime(fireTime: string, quietHours: QuietHours | null): string {
  if (quietHours === null || !isWithinQuietHours(fireTime, quietHours)) {
    return fireTime;
  }
  if (!isWithinQuietHours('08:00', quietHours)) {
    return '08:00';
  }
  return quietHours.end;
}

function combineDateTime(dateIso: string, time: string): number {
  const [h, m] = time.split(':').map(Number);
  const date = parseIsoDate(dateIso);
  date.setHours(h ?? 8, m ?? 0, 0, 0);
  return date.getTime();
}

function makeEntry(
  notificationType: NotificationType,
  sourceType: PlanEntry['sourceType'],
  sourceId: string,
  bikeId: string | null,
  fireDateIso: string,
  settings: ReminderSettings,
  data: PlanEntry['data'],
): PlanEntry {
  const fireTime = effectiveFireTime(settings.fireTime, settings.quietHours);
  return {
    key: `${sourceType}:${sourceId}:${notificationType}:${fireDateIso}`,
    sourceType,
    sourceId,
    bikeId,
    notificationType,
    fireAtMs: combineDateTime(fireDateIso, fireTime),
    fireDateIso,
    data,
  };
}

const PRIORITY: Record<NotificationType, number> = {
  maintenance_overdue: 0,
  document_expiry: 1,
  maintenance_due: 2,
  backup_reminder: 3,
};

function applyCaps(entries: readonly PlanEntry[]): PlanEntry[] {
  const sorted = [...entries].sort((a, b) => {
    const p = PRIORITY[a.notificationType] - PRIORITY[b.notificationType];
    return p !== 0 ? p : a.fireAtMs - b.fireAtMs;
  });
  const perBike = new Map<string, number>();
  const kept: PlanEntry[] = [];
  for (const entry of sorted) {
    if (kept.length >= REMINDER_CAP_TOTAL) {
      break;
    }
    if (entry.bikeId !== null) {
      const count = perBike.get(entry.bikeId) ?? 0;
      if (count >= REMINDER_CAP_PER_BIKE) {
        continue;
      }
      perBike.set(entry.bikeId, count + 1);
    }
    kept.push(entry);
  }
  return kept;
}

export function planReminders(input: PlannerInput, nowMs: number): PlanEntry[] {
  const today = toIsoDate(new Date(nowMs));
  const entries: PlanEntry[] = [];

  for (const bike of input.bikes) {
    if (bike.isArchived === 1) {
      continue;
    }
    const schedules = input.schedulesByBike[bike.id] ?? [];
    const rateInfo = input.rateByBike[bike.id] ?? { rate: DEFAULT_DAILY_KM_RATE, confidence: 'low' as const };

    for (const schedule of schedules) {
      if (schedule.isEnabled !== 1 || schedule.isMuted === 1) {
        continue;
      }
      if (schedule.snoozedUntil !== null && schedule.snoozedUntil >= today) {
        continue;
      }
      const projection = projectDue(schedule, bike.currentOdometerKm, today, rateInfo);
      if (projection === null) {
        continue;
      }
      const daysUntilDue = daysBetween(today, projection.dueDateIso);
      const data: PlanEntry['data'] = {
        bikeNickname: bike.nickname,
        componentType: schedule.componentType,
        customName: schedule.customName,
        governs: projection.governs,
        remainingKm: projection.remainingKm,
        remainingDays: projection.remainingDays,
        lowConfidence: projection.lowConfidence,
      };

      if (daysUntilDue <= 0) {
        if (!input.settings.prefs.maintenance_overdue) {
          continue;
        }
        const occurrences = Array.from({ length: OVERDUE_NAG_MAX }, (_, i) =>
          addDays(projection.dueDateIso, i * OVERDUE_NAG_INTERVAL_DAYS),
        ).filter((d) => d >= today);
        for (const dateIso of occurrences) {
          entries.push(makeEntry('maintenance_overdue', 'schedule', schedule.id, bike.id, dateIso, input.settings, data));
        }
      } else {
        if (!input.settings.prefs.maintenance_due) {
          continue;
        }
        const leadDays = projection.governs === 'km' ? KM_LEAD_DAYS : TIME_LEAD_DAYS;
        if (daysUntilDue > leadDays) {
          continue;
        }
        const candidates = [addDays(projection.dueDateIso, -leadDays), projection.dueDateIso].filter(
          (d) => d >= today,
        );
        for (const dateIso of candidates) {
          entries.push(makeEntry('maintenance_due', 'schedule', schedule.id, bike.id, dateIso, input.settings, data));
        }
      }
    }
  }

  if (input.settings.prefs.document_expiry) {
    for (const doc of input.documents) {
      if (!EXPIRY_DOC_TYPES.includes(doc.docType as DocType) || doc.expiryDate === null) {
        continue;
      }
      if (doc.expiryDate < today) {
        continue; // already-expired one-off is deferred (see file header)
      }
      const candidates = [30, 7, 1].map((d) => addDays(doc.expiryDate!, -d)).filter((d) => d >= today);
      for (const dateIso of candidates) {
        entries.push(
          makeEntry('document_expiry', 'document', doc.id, doc.motorcycleId, dateIso, input.settings, {
            bikeNickname: null,
            docType: doc.docType as DocType,
            docTitle: doc.title,
          }),
        );
      }
    }
  }

  // De-dup defensively (construction should already guarantee unique keys).
  const seen = new Set<string>();
  const deduped = entries.filter((e) => {
    if (seen.has(e.key)) {
      return false;
    }
    seen.add(e.key);
    return true;
  });

  return applyCaps(deduped);
}
