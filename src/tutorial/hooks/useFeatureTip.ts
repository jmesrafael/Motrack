import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { InteractionManager } from 'react-native';

import { useTutorialStore } from '@/stores/useTutorialStore';
import { isTutorialActive, startTutorial } from '../engine';

/**
 * Feature discovery: shows a one-shot contextual tip (a `tip:` tutorial) the
 * first time a screen gains focus. Seen tips never re-fire — unless Tutorial
 * Mode is on, which re-enables all tips without touching user data. Never
 * interrupts a running tour.
 */
export function useFeatureTip(tipId: string): void {
  useFocusEffect(
    useCallback(() => {
      const { progress, hydrated } = useTutorialStore.getState();
      const seen = progress.tipsSeen[`tip:${tipId}`] !== undefined;
      if (!hydrated || (seen && !progress.tutorialMode)) {
        return;
      }
      // Onboarding first — no tips before the welcome flow is resolved.
      if (progress.welcome !== 'completed') {
        return;
      }
      const task = InteractionManager.runAfterInteractions(() => {
        if (!isTutorialActive()) {
          startTutorial(`tip:${tipId}`);
        }
      });
      return () => task.cancel();
    }, [tipId]),
  );
}
