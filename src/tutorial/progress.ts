import { SettingsRepository } from '@/db/repositories/SettingsRepository';

/**
 * Tutorial progress persistence — one JSON blob on the `app_settings` KV table
 * (same path as every other persisted setting; survives restarts and updates).
 * Corrupt/unknown payloads fall back to defaults, never crash. Note that
 * "Delete all data" wipes `app_settings`, so onboarding re-runs after a full
 * reset — intended: a wiped app is a fresh start.
 */

const PROGRESS_KEY = 'tutorial.progress.v1';

export type TutorialStatus = 'not_started' | 'in_progress' | 'skipped' | 'completed';

export interface TutorialProgressRecord {
  status: TutorialStatus;
  /** Resume point (index into the resolved step list). */
  stepIndex: number;
  /** Config version the saved stepIndex belongs to. */
  version: number;
  replayCount: number;
  completedAt: number | null;
}

export interface TutorialProgressState {
  schemaVersion: 1;
  welcome: 'pending' | 'completed';
  setup: 'pending' | 'completed' | 'skipped';
  tourOffer: 'unseen' | 'later' | 'never' | 'accepted';
  /** Settings toggle: re-enables contextual tips without touching user data. */
  tutorialMode: boolean;
  tutorials: Record<string, TutorialProgressRecord>;
  /** tipId → timestamp first seen. */
  tipsSeen: Record<string, number>;
}

export function defaultProgress(): TutorialProgressState {
  return {
    schemaVersion: 1,
    welcome: 'pending',
    setup: 'pending',
    tourOffer: 'unseen',
    tutorialMode: false,
    tutorials: {},
    tipsSeen: {},
  };
}

export function defaultRecord(version: number): TutorialProgressRecord {
  return { status: 'not_started', stepIndex: 0, version, replayCount: 0, completedAt: null };
}

const STATUSES: readonly TutorialStatus[] = ['not_started', 'in_progress', 'skipped', 'completed'];
const WELCOME_VALUES = ['pending', 'completed'] as const;
const SETUP_VALUES = ['pending', 'completed', 'skipped'] as const;
const OFFER_VALUES = ['unseen', 'later', 'never', 'accepted'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/** Shape-validates a stored blob field by field — stale/corrupt data degrades to defaults. */
function normalize(raw: unknown): TutorialProgressState {
  const base = defaultProgress();
  if (!isRecord(raw) || raw.schemaVersion !== 1) {
    return base;
  }
  const tutorials: Record<string, TutorialProgressRecord> = {};
  if (isRecord(raw.tutorials)) {
    for (const [id, entry] of Object.entries(raw.tutorials)) {
      if (!isRecord(entry)) {
        continue;
      }
      tutorials[id] = {
        status: pick(entry.status, STATUSES, 'not_started'),
        stepIndex: typeof entry.stepIndex === 'number' ? entry.stepIndex : 0,
        version: typeof entry.version === 'number' ? entry.version : 0,
        replayCount: typeof entry.replayCount === 'number' ? entry.replayCount : 0,
        completedAt: typeof entry.completedAt === 'number' ? entry.completedAt : null,
      };
    }
  }
  const tipsSeen: Record<string, number> = {};
  if (isRecord(raw.tipsSeen)) {
    for (const [id, seenAt] of Object.entries(raw.tipsSeen)) {
      if (typeof seenAt === 'number') {
        tipsSeen[id] = seenAt;
      }
    }
  }
  return {
    schemaVersion: 1,
    welcome: pick(raw.welcome, WELCOME_VALUES, base.welcome),
    setup: pick(raw.setup, SETUP_VALUES, base.setup),
    tourOffer: pick(raw.tourOffer, OFFER_VALUES, base.tourOffer),
    tutorialMode: raw.tutorialMode === true,
    tutorials,
    tipsSeen,
  };
}

export function loadProgress(): TutorialProgressState {
  return normalize(SettingsRepository.get<unknown>(PROGRESS_KEY, null));
}

export function saveProgress(state: TutorialProgressState): void {
  SettingsRepository.set(PROGRESS_KEY, state);
}

/** Resets tutorial/onboarding progress only — user data is untouched. */
export function resetProgress(): TutorialProgressState {
  SettingsRepository.remove(PROGRESS_KEY);
  return defaultProgress();
}

/**
 * A config version bump invalidates a saved mid-tutorial resume point (the
 * step list changed under it); completed/skipped verdicts are kept.
 */
export function reconcileRecordVersion(
  record: TutorialProgressRecord,
  configVersion: number,
): TutorialProgressRecord {
  if (record.version === configVersion) {
    return record;
  }
  return {
    ...record,
    version: configVersion,
    stepIndex: 0,
    status: record.status === 'in_progress' ? 'not_started' : record.status,
  };
}
