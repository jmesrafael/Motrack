import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

import { Icon } from '@/components/Icon';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface CompletionOverlayProps {
  visible: boolean;
  message: string;
  /** Called once the celebration finishes — navigate away here. */
  onDone: () => void;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    fill: {
      ...StyleSheet.absoluteFill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.bg.page,
    },
    ring: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: t.feedback.success.bg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: t.space.s4,
    },
    core: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: t.feedback.success.base,
      alignItems: 'center',
      justifyContent: 'center',
    },
    message: typeStyle(t.type.h2, t.text.primary, t.type.family),
  }),
);

/**
 * A satisfying but lightweight "saved" celebration for maintenance
 * completion and other milestone saves: a check pops in, holds briefly, then
 * hands off to `onDone` (the caller navigates back / shows a toast).
 * Skips the pop animation under reduce-motion but keeps the same timing.
 */
export function CompletionOverlay({ visible, message, onDone }: CompletionOverlayProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const reduceMotion = useReducedMotion();
  const [scale] = useState(() => new Animated.Value(0));
  const [opacity] = useState(() => new Animated.Value(0));
  const [checkScale] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!visible) {
      return;
    }
    opacity.setValue(0);
    scale.setValue(0.6);
    checkScale.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: reduceMotion ? 0 : 160, useNativeDriver: true }).start();
    Animated.spring(scale, {
      toValue: 1,
      damping: 12,
      stiffness: 180,
      useNativeDriver: true,
    }).start();
    Animated.sequence([
      Animated.delay(reduceMotion ? 0 : 90),
      Animated.spring(checkScale, { toValue: 1, damping: 9, stiffness: 220, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(onDone, reduceMotion ? 400 : 950);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View style={[styles.fill, { opacity }]} pointerEvents="none">
      <Animated.View style={[styles.ring, { transform: [{ scale }] }]}>
        <Animated.View style={[styles.core, { transform: [{ scale: checkScale }] }]}>
          <Icon name="check" size={tokens.iconSize.feature} color={tokens.primary.on} />
        </Animated.View>
      </Animated.View>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}
