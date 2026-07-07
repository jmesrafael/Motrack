import { create } from 'zustand';

import { onDomainEvents } from '@/lib/events';
import {
  defaultProgress,
  defaultRecord,
  loadProgress,
  resetProgress,
  saveProgress,
  type TutorialProgressRecord,
  type TutorialProgressState,
} from '@/tutorial/progress';
import type { SpotlightShape, TargetRect, TutorialStep } from '@/tutorial/types';

/**
 * Tutorial state — persisted progress mirrored to SQLite (write-through, same
 * pattern as useSettingsStore) plus the engine's runtime slice. Runtime is
 * driven exclusively by tutorial/engine.ts; UI subscribes with narrow
 * selectors so the tree renders nothing extra while `phase === 'idle'`.
 */

export type TutorialPhase = 'idle' | 'preparing' | 'showing';

interface TutorialState {
  // Persisted mirror
  progress: TutorialProgressState;
  hydrated: boolean;
  hydrate: () => void;
  markWelcomeCompleted: () => void;
  markSetup: (value: 'completed' | 'skipped') => void;
  setTourOffer: (value: 'later' | 'never' | 'accepted' | 'unseen') => void;
  setTutorialMode: (on: boolean) => void;
  markTipSeen: (tipId: string) => void;
  updateTutorialRecord: (id: string, changes: Partial<TutorialProgressRecord>) => void;
  resetAllProgress: () => void;

  // Runtime (never persisted; owned by engine.ts)
  phase: TutorialPhase;
  activeId: string | null;
  activeKind: 'tour' | 'tip' | null;
  stepIndex: number;
  resolvedSteps: TutorialStep[];
  targetRect: TargetRect | null;
  targetShape: SpotlightShape | null;
  /** Anchor whose real tap the engine is waiting on (interactive steps). */
  interactiveAnchorId: string | null;
}

function persist(
  set: (partial: Partial<TutorialState>) => void,
  progress: TutorialProgressState,
): void {
  saveProgress(progress);
  set({ progress });
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  progress: defaultProgress(),
  hydrated: false,
  hydrate: () => {
    set({ progress: loadProgress(), hydrated: true });
  },
  markWelcomeCompleted: () => {
    persist(set, { ...get().progress, welcome: 'completed' });
  },
  markSetup: (value) => {
    persist(set, { ...get().progress, setup: value });
  },
  setTourOffer: (value) => {
    persist(set, { ...get().progress, tourOffer: value });
  },
  setTutorialMode: (on) => {
    persist(set, { ...get().progress, tutorialMode: on });
  },
  markTipSeen: (tipId) => {
    const progress = get().progress;
    persist(set, { ...progress, tipsSeen: { ...progress.tipsSeen, [tipId]: Date.now() } });
  },
  updateTutorialRecord: (id, changes) => {
    const progress = get().progress;
    const existing = progress.tutorials[id] ?? defaultRecord(0);
    persist(set, {
      ...progress,
      tutorials: { ...progress.tutorials, [id]: { ...existing, ...changes } },
    });
  },
  resetAllProgress: () => {
    set({ progress: resetProgress() });
  },

  phase: 'idle',
  activeId: null,
  activeKind: null,
  stepIndex: 0,
  resolvedSteps: [],
  targetRect: null,
  targetShape: null,
  interactiveAnchorId: null,
}));

// Re-read persisted progress when settings-level data changes (notably
// "Delete all data", which wipes app_settings — onboarding must reset with it).
// Tutorial store writes never emit this event, so there is no loop.
onDomainEvents(['settings:changed'], () => {
  if (useTutorialStore.getState().hydrated) {
    useTutorialStore.getState().hydrate();
  }
});
