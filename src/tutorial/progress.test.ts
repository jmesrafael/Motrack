jest.mock('@/db/repositories/SettingsRepository', () => {
  const store = new Map<string, string>();
  return {
    SettingsRepository: {
      get: <T,>(key: string, fallback: T): T => {
        const raw = store.get(key);
        if (raw === undefined) {
          return fallback;
        }
        try {
          return JSON.parse(raw) as T;
        } catch {
          return fallback;
        }
      },
      set: (key: string, value: unknown) => {
        store.set(key, JSON.stringify(value));
      },
      remove: (key: string) => {
        store.delete(key);
      },
      __store: store,
    },
  };
});

import { SettingsRepository } from '@/db/repositories/SettingsRepository';
import {
  defaultProgress,
  defaultRecord,
  loadProgress,
  reconcileRecordVersion,
  resetProgress,
  saveProgress,
} from './progress';

const kv = (SettingsRepository as unknown as { __store: Map<string, string> }).__store;

beforeEach(() => kv.clear());

describe('tutorial progress persistence', () => {
  test('roundtrips a full state', () => {
    const state = defaultProgress();
    state.welcome = 'completed';
    state.setup = 'skipped';
    state.tourOffer = 'later';
    state.tutorialMode = true;
    state.tutorials['dashboard'] = {
      status: 'in_progress',
      stepIndex: 3,
      version: 1,
      replayCount: 2,
      completedAt: null,
    };
    state.tipsSeen['tip:search'] = 123;
    saveProgress(state);
    expect(loadProgress()).toEqual(state);
  });

  test('falls back to defaults on corrupt payloads', () => {
    kv.set('tutorial.progress.v1', '{"schemaVersion":99,"welcome":"???"}');
    expect(loadProgress()).toEqual(defaultProgress());
    kv.set('tutorial.progress.v1', 'not json at all');
    expect(loadProgress()).toEqual(defaultProgress());
  });

  test('drops unknown field values but keeps valid ones', () => {
    saveProgress({
      ...defaultProgress(),
      welcome: 'completed',
      tutorials: {
        ok: { status: 'completed', stepIndex: 0, version: 2, replayCount: 0, completedAt: 5 },
        bad: { status: 'weird', stepIndex: 'x', version: null, replayCount: [], completedAt: 'y' },
      },
    } as never);
    const loaded = loadProgress();
    expect(loaded.welcome).toBe('completed');
    expect(loaded.tutorials['ok']?.status).toBe('completed');
    expect(loaded.tutorials['bad']).toEqual(defaultRecord(0));
  });

  test('version bump discards an in_progress resume point but keeps verdicts', () => {
    const inProgress = { status: 'in_progress', stepIndex: 4, version: 1, replayCount: 0, completedAt: null } as const;
    expect(reconcileRecordVersion(inProgress, 2)).toEqual({
      status: 'not_started',
      stepIndex: 0,
      version: 2,
      replayCount: 0,
      completedAt: null,
    });
    const completed = { status: 'completed', stepIndex: 0, version: 1, replayCount: 1, completedAt: 9 } as const;
    expect(reconcileRecordVersion(completed, 2).status).toBe('completed');
    expect(reconcileRecordVersion(completed, 1)).toBe(completed);
  });

  test('reset clears only the tutorial key', () => {
    kv.set('theme', '"dark"');
    saveProgress({ ...defaultProgress(), welcome: 'completed' });
    const fresh = resetProgress();
    expect(fresh).toEqual(defaultProgress());
    expect(kv.has('tutorial.progress.v1')).toBe(false);
    expect(kv.get('theme')).toBe('"dark"');
  });
});
