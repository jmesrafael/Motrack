import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Mask, Rect } from 'react-native-svg';

import { useTheme } from '@/theme/useTheme';
import type { SpotlightShape, TargetRect } from '../types';

/**
 * Full-screen scrim with an animated transparent cutout around the target.
 * The cutout is an SVG mask (the white/black fills below are mask luminance
 * values, not UI colors — the visible scrim uses the overlay.scrim token).
 * Touch policy: four blocker views cover the scrim; the cutout hole is left
 * open on interactive steps so the real element receives real touches, and
 * covered on passive steps so nothing is triggered by accident.
 */

const AnimatedRect = Animated.createAnimatedComponent(Rect);

export interface SpotlightOverlayProps {
  rect: TargetRect | null;
  shape: SpotlightShape | null;
  /** Interactive steps leave the cutout touchable; passive steps cover it. */
  interactive: boolean;
  /** Blockers only engage while a step is fully shown. */
  blocking: boolean;
  windowWidth: number;
  windowHeight: number;
  reduceMotion: boolean;
}

interface CutoutFrame {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}

function cutoutFrame(
  rect: TargetRect | null,
  shape: SpotlightShape | null,
  windowWidth: number,
  windowHeight: number,
  fallbackRadius: number,
): CutoutFrame {
  if (rect === null) {
    // Centered step: collapse the cutout to a point mid-screen.
    return { x: windowWidth / 2, y: windowHeight / 2, width: 0, height: 0, radius: 0 };
  }
  const padding = shape?.padding ?? 8;
  const kind = shape?.kind ?? 'rect';
  if (kind === 'circle') {
    const size = Math.max(rect.width, rect.height) + padding * 2;
    return {
      x: rect.x + rect.width / 2 - size / 2,
      y: rect.y + rect.height / 2 - size / 2,
      width: size,
      height: size,
      radius: size / 2,
    };
  }
  const width = rect.width + padding * 2;
  const height = rect.height + padding * 2;
  return {
    x: rect.x - padding,
    y: rect.y - padding,
    width,
    height,
    radius: kind === 'pill' ? height / 2 : (shape?.radius ?? fallbackRadius),
  };
}

export function SpotlightOverlay({
  rect,
  shape,
  interactive,
  blocking,
  windowWidth,
  windowHeight,
  reduceMotion,
}: SpotlightOverlayProps) {
  const { tokens } = useTheme();
  const frame = cutoutFrame(rect, shape, windowWidth, windowHeight, tokens.radius.md);

  const x = useSharedValue(frame.x);
  const y = useSharedValue(frame.y);
  const w = useSharedValue(frame.width);
  const h = useSharedValue(frame.height);
  const r = useSharedValue(frame.radius);
  const scrimOpacity = useSharedValue(0);
  const hasShownRef = useRef(false);

  useEffect(() => {
    const duration = reduceMotion ? 0 : tokens.motion.base.durationMs;
    if (!hasShownRef.current && rect !== null) {
      // First target: place the cutout instantly, then fade the scrim in.
      hasShownRef.current = true;
      x.value = frame.x;
      y.value = frame.y;
      w.value = frame.width;
      h.value = frame.height;
      r.value = frame.radius;
    } else {
      x.value = withTiming(frame.x, { duration });
      y.value = withTiming(frame.y, { duration });
      w.value = withTiming(frame.width, { duration });
      h.value = withTiming(frame.height, { duration });
      r.value = withTiming(frame.radius, { duration });
    }
    scrimOpacity.value = withTiming(1, {
      duration: reduceMotion ? 0 : tokens.motion.fast.durationMs,
    });
  }, [frame.x, frame.y, frame.width, frame.height, frame.radius, rect, reduceMotion]);

  const cutoutProps = useAnimatedProps(() => ({
    x: x.value,
    y: y.value,
    width: w.value,
    height: h.value,
    rx: r.value,
    ry: r.value,
  }));
  const rootStyle = useAnimatedStyle(() => ({ opacity: scrimOpacity.value }));
  const topBlocker = useAnimatedStyle(() => ({
    left: 0,
    right: 0,
    top: 0,
    height: Math.max(y.value, 0),
  }));
  const bottomBlocker = useAnimatedStyle(() => ({
    left: 0,
    right: 0,
    top: y.value + h.value,
    height: Math.max(windowHeight - (y.value + h.value), 0),
  }));
  const leftBlocker = useAnimatedStyle(() => ({
    left: 0,
    top: y.value,
    width: Math.max(x.value, 0),
    height: h.value,
  }));
  const rightBlocker = useAnimatedStyle(() => ({
    left: x.value + w.value,
    top: y.value,
    width: Math.max(windowWidth - (x.value + w.value), 0),
    height: h.value,
  }));
  const holeCover = useAnimatedStyle(() => ({
    left: x.value,
    top: y.value,
    width: w.value,
    height: h.value,
  }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, rootStyle]}
      pointerEvents={blocking ? 'box-none' : 'none'}>
      <Svg width={windowWidth} height={windowHeight} pointerEvents="none">
        <Mask id="tutorial-spotlight">
          <Rect x={0} y={0} width={windowWidth} height={windowHeight} fill="#fff" />
          <AnimatedRect animatedProps={cutoutProps} fill="#000" />
        </Mask>
        <Rect
          x={0}
          y={0}
          width={windowWidth}
          height={windowHeight}
          fill={tokens.overlay.scrim}
          mask="url(#tutorial-spotlight)"
        />
      </Svg>
      {blocking ? (
        <>
          <Animated.View style={[styles.blocker, topBlocker]} />
          <Animated.View style={[styles.blocker, bottomBlocker]} />
          <Animated.View style={[styles.blocker, leftBlocker]} />
          <Animated.View style={[styles.blocker, rightBlocker]} />
          {interactive ? null : <Animated.View style={[styles.blocker, holeCover]} />}
        </>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  blocker: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
});
