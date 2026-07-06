import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface HealthRingProps {
  /** 0–100, or null when the score is undisplayable (HEALTH_SCORE.md §5). */
  score: number | null;
  bandLabel: string;
  /** Resolved health band tokens — mapping happens in the feature hook. */
  color: string;
  colorBg: string;
  scoreSuffix: string;
  size?: number;
  accessibilityLabel: string;
}

// Gauge geometry: 270° sweep opening at the bottom — instrument-cluster feel.
const SWEEP_DEG = 270;
const START_DEG = 225;
const TICK_COUNT = 28;

function polarPoint(center: number, radius: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: center + radius * Math.cos(rad),
    y: center + radius * Math.sin(rad),
  };
}

function arcPath(center: number, radius: number, startDeg: number, sweepDeg: number): string {
  const start = polarPoint(center, radius, startDeg);
  const end = polarPoint(center, radius, startDeg + sweepDeg);
  const largeArc = sweepDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    center: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      gap: t.space.s1,
    },
    score: {
      ...typeStyle(t.type.display, t.text.primary),
      fontVariant: ['tabular-nums'],
    },
    suffix: typeStyle(t.type.caption, t.text.tertiary),
    bandChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s1,
      borderRadius: t.radius.full,
      paddingHorizontal: t.space.s3,
      paddingVertical: t.space.s1,
      marginTop: t.space.s1,
    },
    bandDot: {
      width: 8,
      height: 8,
      borderRadius: t.radius.full,
    },
    bandLabel: typeStyle(t.type.caption, t.text.primary),
  }),
);

export function HealthRing({
  score,
  bandLabel,
  color,
  colorBg,
  scoreSuffix,
  size = 220,
  accessibilityLabel,
}: HealthRingProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const isReducedMotion = useReducedMotion();

  const target = score === null ? 0 : Math.max(0, Math.min(100, score)) / 100;
  const [progress, setProgress] = useState(0);

  // Sweep-in on appear/score change (motion.slow); instant under reduced motion.
  useEffect(() => {
    if (isReducedMotion) {
      setProgress(target);
      return;
    }
    let frame = 0;
    const durationMs = tokens.motion.slow.durationMs;
    const startedAt = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startedAt;
      const linear = Math.min(1, elapsed / durationMs);
      const eased = 1 - (1 - linear) ** 3;
      setProgress(target * eased);
      if (linear < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, isReducedMotion, tokens.motion.slow.durationMs]);

  const center = size / 2;
  const trackRadius = center - 16;
  const strokeWidth = 12;
  const tickOuter = center - 1;
  const tickInner = center - 7;

  const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
    const angle = START_DEG + (SWEEP_DEG / (TICK_COUNT - 1)) * i;
    const outer = polarPoint(center, tickOuter, angle);
    const inner = polarPoint(center, tickInner, angle);
    return { key: i, x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y };
  });

  return (
    <View
      style={[styles.root, { width: size, height: size }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}>
      <Svg width={size} height={size}>
        {ticks.map((tickLine) => (
          <Line
            key={tickLine.key}
            x1={tickLine.x1}
            y1={tickLine.y1}
            x2={tickLine.x2}
            y2={tickLine.y2}
            stroke={tokens.border.divider}
            strokeWidth={2}
            strokeLinecap="round"
          />
        ))}
        <Path
          d={arcPath(center, trackRadius, START_DEG, SWEEP_DEG)}
          stroke={tokens.bg.surfaceVariant}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
        {progress > 0 ? (
          <Path
            d={arcPath(center, trackRadius, START_DEG, Math.max(1, SWEEP_DEG * progress))}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
        ) : null}
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.score}>{score === null ? '—' : String(score)}</Text>
        <Text style={styles.suffix}>{scoreSuffix}</Text>
        <View style={[styles.bandChip, { backgroundColor: colorBg }]}>
          <View style={[styles.bandDot, { backgroundColor: color }]} />
          <Text style={styles.bandLabel}>{bandLabel}</Text>
        </View>
      </View>
    </View>
  );
}
