import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

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
}

// Gauge geometry: 270° sweep opening at the bottom — instrument-cluster feel.
// Purely visual: the parent surface must carry the accessibility label
// ("Health score 87, Good" — SCREEN_SPECIFICATIONS.md S-04 a11y).
const SWEEP_DEG = 270;
const START_DEG = 225;
const STROKE_WIDTH = 14;

const AnimatedPath = Animated.createAnimatedComponent(Path);

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
  size = 184,
}: HealthRingProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const isReducedMotion = useReducedMotion();

  const target = score === null ? 0 : Math.max(0, Math.min(100, score)) / 100;

  const center = size / 2;
  const radius = center - STROKE_WIDTH / 2 - 1;
  const arcLength = 2 * Math.PI * radius * (SWEEP_DEG / 360);
  const fullArc = arcPath(center, radius, START_DEG, SWEEP_DEG);

  // Sweep to value on appear/score change (motion.slow) — native driver via
  // animated dashoffset, never a JS frame loop (ANIMATION_GUIDE.md §1.3/§3).
  const progress = useSharedValue(0);
  useEffect(() => {
    if (isReducedMotion) {
      progress.value = target;
      return;
    }
    progress.value = withTiming(target, {
      duration: tokens.motion.slow.durationMs,
      easing: Easing.out(Easing.cubic),
    });
  }, [target, isReducedMotion, progress, tokens.motion.slow.durationMs]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: arcLength * (1 - progress.value),
  }));

  return (
    <View style={[styles.root, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Path
          d={fullArc}
          stroke={tokens.bg.surfaceVariant}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          fill="none"
        />
        {score !== null ? (
          <AnimatedPath
            d={fullArc}
            stroke={color}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${arcLength} ${arcLength}`}
            animatedProps={animatedProps}
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
