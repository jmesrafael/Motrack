import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Icon } from '@/components/Icon';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';
import { interpolate, strings } from '@/i18n/strings';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';
import { placeTooltip, type Placement } from '../placeTooltip';
import type { TargetRect, TutorialStep } from '../types';

/**
 * Coach-mark card: title, body, progress, controls, and an arrow pointing at
 * the spotlighted target. Positioned by the pure placeTooltip() geometry once
 * its own size is measured; repositions automatically near screen edges so it
 * never clips. Every step exposes Skip and Close — the user is never trapped.
 */

const ARROW_SIZE = 12;
const SPOTLIGHT_GAP = 20;

export interface TutorialTooltipProps {
  step: TutorialStep;
  stepIndex: number;
  totalSteps: number;
  targetRect: TargetRect | null;
  windowWidth: number;
  windowHeight: number;
  insetTop: number;
  insetBottom: number;
  reduceMotion: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onClose: () => void;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    card: {
      position: 'absolute',
      maxWidth: 400,
      backgroundColor: t.bg.sheet,
      borderRadius: t.radius.lg,
      padding: t.space.s4,
      gap: t.space.s3,
      ...(t.elevation.sheet ?? {}),
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s2,
    },
    title: {
      ...typeStyle(t.type.h2, t.text.primary),
      flex: 1,
    },
    closeButton: {
      width: 44,
      height: 44,
      marginTop: -t.space.s2,
      marginRight: -t.space.s2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: typeStyle(t.type.body, t.text.secondary),
    tryIt: typeStyle(t.type.bodyStrong, t.primary.base),
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s2,
    },
    progress: {
      ...typeStyle(t.type.caption, t.text.tertiary),
      flex: 1,
    },
    skipButton: {
      minHeight: 44,
      justifyContent: 'center',
      paddingHorizontal: t.space.s2,
    },
    skipLabel: typeStyle(t.type.bodyStrong, t.text.secondary),
    arrow: {
      position: 'absolute',
      width: ARROW_SIZE,
      height: ARROW_SIZE,
      backgroundColor: t.bg.sheet,
      transform: [{ rotate: '45deg' }],
    },
    bodyScroll: {
      maxHeight: 220,
    },
  }),
);

function tryItHint(step: TutorialStep): string | null {
  switch (step.advance.type) {
    case 'tap-anchor':
      return strings.tutorial.common.tryIt;
    case 'long-press-anchor':
      return strings.tutorial.common.tryItLong;
    case 'navigate':
      return strings.tutorial.common.tryItNavigate;
    case 'event':
      return strings.tutorial.common.tryItSave;
    default:
      return null;
  }
}

export function TutorialTooltip({
  step,
  stepIndex,
  totalSteps,
  targetRect,
  windowWidth,
  windowHeight,
  insetTop,
  insetBottom,
  reduceMotion,
  onNext,
  onPrev,
  onSkip,
  onClose,
}: TutorialTooltipProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const cardRef = useRef<View | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const opacity = useSharedValue(0);
  const shift = useSharedValue(8);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((prev) =>
      prev !== null && Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1
        ? prev
        : { width, height },
    );
  };

  // Announce and focus each step for screen readers; slide/fade the card in.
  useEffect(() => {
    opacity.value = 0;
    shift.value = 8;
    opacity.value = withTiming(1, {
      duration: reduceMotion ? 0 : tokens.motion.fast.durationMs,
    });
    shift.value = withTiming(0, {
      duration: reduceMotion ? 0 : tokens.motion.fast.durationMs,
    });
    AccessibilityInfo.announceForAccessibility(`${step.title}. ${step.body}`);
    const focusTimer = setTimeout(() => {
      const node = cardRef.current !== null ? findNodeHandle(cardRef.current) : null;
      if (node !== null) {
        AccessibilityInfo.setAccessibilityFocus(node);
      }
    }, 300);
    return () => clearTimeout(focusTimer);
  }, [step.id]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: shift.value }],
  }));

  const measured = size !== null;
  const placement: Placement = placeTooltip({
    target: targetRect,
    tooltipWidth: size?.width ?? Math.min(windowWidth - tokens.space.s4 * 2, 400),
    tooltipHeight: size?.height ?? 180,
    windowWidth,
    windowHeight,
    insetTop,
    insetBottom,
    gutter: tokens.space.s4,
    gap: SPOTLIGHT_GAP,
    cornerRadius: tokens.radius.lg,
    preferred: step.placement ?? 'auto',
  });

  const hint = tryItHint(step);
  const isPassive = step.advance.type === 'next';
  const isLast = stepIndex === totalSteps - 1;

  return (
    <Animated.View
      ref={cardRef}
      onLayout={onLayout}
      accessibilityViewIsModal={isPassive}
      style={[
        styles.card,
        animatedStyle,
        {
          left: placement.x,
          top: placement.y,
          width: Math.min(windowWidth - tokens.space.s4 * 2, 400),
        },
        measured ? null : { opacity: 0 },
      ]}>
      {placement.arrowX !== null ? (
        <View
          pointerEvents="none"
          style={[
            styles.arrow,
            placement.side === 'below'
              ? { top: -ARROW_SIZE / 2, left: placement.arrowX - ARROW_SIZE / 2 }
              : { bottom: -ARROW_SIZE / 2, left: placement.arrowX - ARROW_SIZE / 2 },
          ]}
        />
      ) : null}
      <View style={styles.headerRow}>
        {step.icon !== undefined ? (
          <Icon name={step.icon} size={tokens.iconSize.md} color={tokens.primary.base} />
        ) : null}
        <Text style={styles.title} accessibilityRole="header">
          {step.title}
        </Text>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={strings.tutorial.common.closeA11y}
          style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.7 }]}>
          <Icon name="close" size={tokens.iconSize.md} color={tokens.icon.secondary} />
        </Pressable>
      </View>
      <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.body}>{step.body}</Text>
        {hint !== null ? <Text style={styles.tryIt}>{hint}</Text> : null}
      </ScrollView>
      <View style={styles.footerRow}>
        <Text style={styles.progress}>
          {interpolate(strings.tutorial.common.stepOf, {
            current: stepIndex + 1,
            total: totalSteps,
          })}
        </Text>
        <Pressable
          onPress={onSkip}
          accessibilityRole="button"
          accessibilityLabel={strings.tutorial.common.skip}
          style={({ pressed }) => [styles.skipButton, pressed && { opacity: 0.7 }]}>
          <Text style={styles.skipLabel}>{strings.tutorial.common.skip}</Text>
        </Pressable>
        {stepIndex > 0 ? (
          <SecondaryButton label={strings.tutorial.common.back} onPress={onPrev} />
        ) : null}
        {isPassive ? (
          <PrimaryButton
            label={isLast ? strings.tutorial.common.done : strings.tutorial.common.next}
            onPress={onNext}
          />
        ) : null}
      </View>
    </Animated.View>
  );
}
