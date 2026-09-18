import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { makeStyles, shadow, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface Segment<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  segments: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      backgroundColor: t.bg.surfaceVariant,
      borderRadius: t.radius.full,
      padding: 3,
    },
    thumb: {
      position: 'absolute',
      top: 3,
      bottom: 3,
      borderRadius: t.radius.full,
      backgroundColor: t.bg.card,
      ...shadow(t.elevation.card),
    },
    segment: {
      flex: 1,
      minHeight: 38,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: typeStyle(t.type.bodyStrong, t.text.secondary, t.type.family),
    activeLabel: {
      color: t.text.primary,
    },
  }),
);

/** Segmented control with a sliding thumb instead of an instant background swap. */
export function SegmentedControl<T extends string>({ segments, value, onChange }: SegmentedControlProps<T>) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const [thumbX] = useState(() => new Animated.Value(0));
  const activeIndex = Math.max(
    0,
    segments.findIndex((s) => s.value === value),
  );

  useEffect(() => {
    if (width === 0) {
      return;
    }
    const segmentWidth = width / segments.length;
    Animated.timing(thumbX, {
      toValue: segmentWidth * activeIndex,
      duration: reduceMotion ? 0 : tokens.motion.fast.durationMs,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, segments.length, width]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    setWidth(nextWidth);
    thumbX.setValue((nextWidth / segments.length) * activeIndex);
  };

  return (
    <View style={styles.row} accessibilityRole="radiogroup" onLayout={handleLayout}>
      {width > 0 ? (
        <Animated.View
          style={[
            styles.thumb,
            {
              width: width / segments.length - 6,
              left: 3,
              transform: [{ translateX: thumbX }],
            },
          ]}
        />
      ) : null}
      {segments.map((segment) => {
        const active = segment.value === value;
        return (
          <Pressable
            key={segment.value}
            onPress={() => onChange(segment.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            style={styles.segment}>
            <Text style={[styles.label, active && styles.activeLabel]}>{segment.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
