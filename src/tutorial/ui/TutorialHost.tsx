import { usePathname } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTutorialStore } from '@/stores/useTutorialStore';
import {
  closeTutorial,
  nextStep,
  onPathnameChange,
  prevStep,
  remeasureActiveTarget,
  setReduceMotion,
  skipTutorial,
} from '../engine';
import { SpotlightOverlay } from './SpotlightOverlay';
import { TutorialTooltip } from './TutorialTooltip';

// Registers all tutorial content with the engine (side-effect import).
import '../configs';

/**
 * Single mount point for the tutorial system, rendered after the navigator in
 * the root layout so it overlays every screen. Renders null while idle — the
 * engine costs nothing when no tutorial runs. Not a Modal on purpose: the host
 * shares the window coordinate space with measureInWindow, and real touches
 * pass through the spotlight cutout to the actual UI element.
 */
export function TutorialHost() {
  const phase = useTutorialStore((s) => s.phase);
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setReduceMotion(reduceMotion);
  }, [reduceMotion]);
  useEffect(() => {
    onPathnameChange(pathname);
  }, [pathname]);

  if (phase === 'idle') {
    return null;
  }
  return <ActiveTutorialLayer reduceMotion={reduceMotion} />;
}

function ActiveTutorialLayer({ reduceMotion }: { reduceMotion: boolean }) {
  const phase = useTutorialStore((s) => s.phase);
  const stepIndex = useTutorialStore((s) => s.stepIndex);
  const resolvedSteps = useTutorialStore((s) => s.resolvedSteps);
  const targetRect = useTutorialStore((s) => s.targetRect);
  const targetShape = useTutorialStore((s) => s.targetShape);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Rotation / fold / split-screen: the target moved — measure it again.
  useEffect(() => {
    void remeasureActiveTarget();
  }, [width, height]);

  const step = resolvedSteps[stepIndex];
  const showing = phase === 'showing' && step !== undefined;
  // Interactive steps (tap / long-press / navigate / save-event) need the
  // real element under the cutout to receive real touches; passive steps
  // cover the hole so nothing fires by accident.
  const interactive =
    step !== undefined && step.advance.type !== 'next' && step.advance.type !== 'delay';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <SpotlightOverlay
        rect={showing ? targetRect : null}
        shape={targetShape}
        interactive={interactive}
        blocking={showing}
        windowWidth={width}
        windowHeight={height}
        reduceMotion={reduceMotion}
      />
      {showing ? (
        <TutorialTooltip
          step={step}
          stepIndex={stepIndex}
          totalSteps={resolvedSteps.length}
          targetRect={targetRect}
          windowWidth={width}
          windowHeight={height}
          insetTop={insets.top}
          insetBottom={insets.bottom}
          reduceMotion={reduceMotion}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipTutorial}
          onClose={closeTutorial}
        />
      ) : null}
    </View>
  );
}
