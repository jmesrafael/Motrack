jest.mock('@/db/repositories/SettingsRepository', () => {
  const store = new Map<string, string>();
  return {
    SettingsRepository: {
      get: <T,>(key: string, fallback: T): T => {
        const raw = store.get(key);
        return raw === undefined ? fallback : (JSON.parse(raw) as T);
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

jest.mock('./conditions', () => ({
  buildConditionCtx: jest.fn(() => ({
    bikeCount: 1,
    hasActiveBike: true,
    hasMaintenanceHistory: false,
    hasFuelLogs: false,
    pathname: '/',
  })),
}));

import { emitDomainEvent } from '@/lib/events';
import { useTutorialStore } from '@/stores/useTutorialStore';
import { buildConditionCtx } from './conditions';
import {
  closeTutorial,
  nextStep,
  onPathnameChange,
  prevStep,
  skipTutorial,
  startTutorial,
} from './engine';
import { registerTutorial } from './registry';
import type { ConditionCtx, TutorialConfig } from './types';

const mockCtx = buildConditionCtx as jest.MockedFunction<typeof buildConditionCtx>;

function makeConfig(overrides: Partial<TutorialConfig> = {}): TutorialConfig {
  return {
    id: 'test-tour',
    kind: 'tour',
    version: 1,
    title: 'Test tour',
    entryRoute: '/',
    steps: [
      { id: 'one', title: 'One', body: 'b', advance: { type: 'next' } },
      { id: 'two', title: 'Two', body: 'b', advance: { type: 'next' } },
      { id: 'three', title: 'Three', body: 'b', advance: { type: 'next' } },
    ],
    ...overrides,
  };
}

/** Flush pending microtasks so async step activation settles. */
async function flush(): Promise<void> {
  for (let i = 0; i < 8; i += 1) {
    await Promise.resolve();
  }
}

let idCounter = 0;
function register(overrides: Partial<TutorialConfig> = {}): TutorialConfig {
  idCounter += 1;
  const config = makeConfig({ id: `tour-${idCounter}`, ...overrides });
  registerTutorial(config);
  return config;
}

beforeEach(async () => {
  jest.useRealTimers();
  onPathnameChange('/');
  closeTutorial();
  await flush();
  useTutorialStore.setState({ progress: { ...useTutorialStore.getState().progress, tutorials: {} } });
  mockCtx.mockClear();
});

describe('engine — start & conditions', () => {
  test('unknown tutorial does not start', () => {
    expect(startTutorial('nope')).toBe(false);
    expect(useTutorialStore.getState().phase).toBe('idle');
  });

  test('tutorial-level condition gates the run', () => {
    const config = register({ condition: (ctx: ConditionCtx) => ctx.hasActiveBike });
    mockCtx.mockReturnValueOnce({
      bikeCount: 0,
      hasActiveBike: false,
      hasMaintenanceHistory: false,
      hasFuelLogs: false,
      pathname: '/',
    });
    expect(startTutorial(config.id)).toBe(false);
  });

  test('step conditions filter the resolved list', async () => {
    const config = register({
      steps: [
        { id: 'a', title: 'A', body: 'b', advance: { type: 'next' } },
        {
          id: 'b',
          title: 'B',
          body: 'b',
          advance: { type: 'next' },
          condition: (ctx: ConditionCtx) => ctx.hasMaintenanceHistory,
        },
        { id: 'c', title: 'C', body: 'b', advance: { type: 'next' } },
      ],
    });
    expect(startTutorial(config.id)).toBe(true);
    await flush();
    const state = useTutorialStore.getState();
    expect(state.resolvedSteps.map((s) => s.id)).toEqual(['a', 'c']);
    expect(state.phase).toBe('showing');
  });
});

describe('engine — passive flow & persistence', () => {
  test('next through all steps completes and persists', async () => {
    const config = register();
    startTutorial(config.id);
    await flush();
    expect(useTutorialStore.getState().progress.tutorials[config.id]?.status).toBe('in_progress');
    nextStep();
    await flush();
    expect(useTutorialStore.getState().stepIndex).toBe(1);
    nextStep();
    await flush();
    nextStep();
    await flush();
    const record = useTutorialStore.getState().progress.tutorials[config.id];
    expect(useTutorialStore.getState().phase).toBe('idle');
    expect(record?.status).toBe('completed');
    expect(record?.completedAt).not.toBeNull();
  });

  test('prev walks back a step', async () => {
    const config = register();
    startTutorial(config.id);
    await flush();
    nextStep();
    await flush();
    prevStep();
    await flush();
    expect(useTutorialStore.getState().stepIndex).toBe(0);
  });

  test('skip records skipped without a resume point', async () => {
    const config = register();
    startTutorial(config.id);
    await flush();
    nextStep();
    await flush();
    skipTutorial();
    const record = useTutorialStore.getState().progress.tutorials[config.id];
    expect(record?.status).toBe('skipped');
    expect(record?.stepIndex).toBe(0);
    expect(useTutorialStore.getState().phase).toBe('idle');
  });

  test('close keeps the resume point', async () => {
    const config = register();
    startTutorial(config.id);
    await flush();
    nextStep();
    await flush();
    closeTutorial();
    const record = useTutorialStore.getState().progress.tutorials[config.id];
    expect(record?.status).toBe('in_progress');
    expect(record?.stepIndex).toBe(1);
  });

  test('resumeFrom starts mid-tour and replay bumps replayCount', async () => {
    const config = register();
    startTutorial(config.id, { resumeFrom: 2, replay: true });
    await flush();
    expect(useTutorialStore.getState().stepIndex).toBe(2);
    expect(useTutorialStore.getState().progress.tutorials[config.id]?.replayCount).toBe(1);
  });
});

describe('engine — interactive triggers', () => {
  test('domain event advances the step', async () => {
    const config = register({
      steps: [
        { id: 'save', title: 'S', body: 'b', advance: { type: 'event', event: 'fuel:changed' } },
        { id: 'after', title: 'A', body: 'b', advance: { type: 'next' } },
      ],
    });
    startTutorial(config.id);
    await flush();
    emitDomainEvent('fuel:changed');
    await flush();
    expect(useTutorialStore.getState().stepIndex).toBe(1);
  });

  test('navigate trigger advances on the matching pathname', async () => {
    const config = register({
      steps: [
        { id: 'go', title: 'G', body: 'b', advance: { type: 'navigate', route: '/maintenance' } },
        { id: 'there', title: 'T', body: 'b', route: '/maintenance', advance: { type: 'next' } },
      ],
    });
    startTutorial(config.id);
    await flush();
    onPathnameChange('/maintenance');
    await flush();
    expect(useTutorialStore.getState().stepIndex).toBe(1);
    expect(useTutorialStore.getState().phase).toBe('showing');
  });

  test('unexpected navigation pauses quietly with progress saved', async () => {
    const config = register({
      steps: [
        { id: 'a', title: 'A', body: 'b', route: '/', advance: { type: 'next' } },
        { id: 'b', title: 'B', body: 'b', route: '/', advance: { type: 'next' } },
      ],
    });
    startTutorial(config.id);
    await flush();
    nextStep();
    await flush();
    onPathnameChange('/settings');
    await flush();
    expect(useTutorialStore.getState().phase).toBe('idle');
    const record = useTutorialStore.getState().progress.tutorials[config.id];
    expect(record?.status).toBe('in_progress');
    expect(record?.stepIndex).toBe(1);
  });

  test('missing anchor times out and skips to the next step', async () => {
    jest.useFakeTimers();
    const config = register({
      steps: [
        { id: 'ghost', title: 'G', body: 'b', anchorId: 'never.registered', advance: { type: 'next' } },
        { id: 'after', title: 'A', body: 'b', advance: { type: 'next' } },
      ],
    });
    startTutorial(config.id);
    await jest.advanceTimersByTimeAsync(3500);
    expect(useTutorialStore.getState().stepIndex).toBe(1);
    expect(useTutorialStore.getState().phase).toBe('showing');
    jest.useRealTimers();
  });

  test('tip dismissal marks it seen', async () => {
    const config = register({
      kind: 'tip',
      steps: [{ id: 'tip', title: 'T', body: 'b', advance: { type: 'next' } }],
    });
    startTutorial(config.id);
    await flush();
    nextStep();
    await flush();
    expect(useTutorialStore.getState().progress.tipsSeen[config.id]).toBeDefined();
    expect(useTutorialStore.getState().phase).toBe('idle');
  });
});
