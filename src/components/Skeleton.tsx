import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View, type DimensionValue } from 'react-native';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/useTheme';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: object;
}

/** Shimmering placeholder block — the one building block for every loading state. */
export function Skeleton({ width = '100%', height = 16, radius }: SkeletonProps) {
  const { tokens } = useTheme();
  const reduceMotion = useReducedMotion();
  const [pulse] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    if (reduceMotion) {
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduceMotion]);

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width,
          height,
          borderRadius: radius ?? tokens.radius.xs,
          backgroundColor: tokens.bg.surfaceVariant,
          opacity: reduceMotion ? 0.6 : pulse,
        },
      ]}
    />
  );
}

/** Dashboard-shaped skeleton: greeting, hero ring, two stat rows, a list. */
export function DashboardSkeleton() {
  return (
    <View style={styles.stack}>
      <View style={styles.headerRow}>
        <Skeleton width={120} height={36} radius={18} />
        <View style={{ flex: 1 }} />
        <Skeleton width={44} height={44} radius={22} />
        <Skeleton width={44} height={44} radius={22} />
      </View>
      <Skeleton width={180} height={28} />
      <Skeleton width={220} height={220} radius={110} style={{ alignSelf: 'center', marginVertical: 8 }} />
      <Skeleton height={64} radius={20} />
      <Skeleton height={64} radius={20} />
      <Skeleton height={90} radius={20} />
      <Skeleton height={90} radius={20} />
    </View>
  );
}

/** Generic list-shaped skeleton for simple list screens. */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <View style={styles.stack}>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} height={64} radius={16} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden' },
  stack: { gap: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
