import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
  caption?: string;
}

const WIDTH = 48;
const HEIGHT = 28;
const KNOB = 22;
const PADDING = 3;

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: t.size.row,
      paddingHorizontal: t.space.s4,
      paddingVertical: t.space.s2,
      gap: t.space.s3,
    },
    body: { flex: 1, gap: 2 },
    label: typeStyle(t.type.body, t.text.primary, t.type.family),
    caption: typeStyle(t.type.caption, t.text.tertiary, t.type.family),
    track: {
      width: WIDTH,
      height: HEIGHT,
      borderRadius: HEIGHT / 2,
      justifyContent: 'center',
    },
    knob: {
      width: KNOB,
      height: KNOB,
      borderRadius: KNOB / 2,
      backgroundColor: '#FFFFFF',
    },
  }),
);

/** Custom brand switch — lime track when on, animated knob (native Switch can't match the accent look everywhere). */
export function Toggle({ value, onChange, label, caption }: ToggleProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const reduceMotion = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(value ? 1 : 0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: value ? 1 : 0,
      duration: reduceMotion ? 0 : tokens.motion.fast.durationMs,
      useNativeDriver: false,
    }).start();
  }, [value, progress, reduceMotion, tokens.motion.fast.durationMs]);

  const trackColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [tokens.bg.surfaceVariant, tokens.primary.base],
  });
  const knobTranslate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [PADDING, WIDTH - KNOB - PADDING],
  });

  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      style={styles.row}>
      <View style={styles.body}>
        <Text style={styles.label}>{label}</Text>
        {caption !== undefined ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>
      <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View style={[styles.knob, { transform: [{ translateX: knobTranslate }] }]} />
      </Animated.View>
    </Pressable>
  );
}
