import { useState, type ReactNode } from 'react';
import {
  Animated,
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/useTheme';

export interface PressableScaleProps extends Omit<PressableProps, 'style' | 'children'> {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Override the token press scale (e.g. 0.94 for small icon buttons). */
  scaleTo?: number;
  /** Also dim on press (cards/rows); buttons usually keep full opacity. */
  dim?: boolean;
  /**
   * Layout style for the outer Pressable. `style` lands on the inner animated
   * view, which is content-sized, so sizing that must come from the parent
   * (flex, height) belongs here — otherwise the press target collapses to its
   * content and top-aligns inside a taller row.
   */
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * The one press-feedback primitive: scale + optional dim, spring back on
 * release. Every button, card, tile and tab item builds on this so press
 * feel is identical app-wide. Honors OS reduce-motion (opacity only).
 */
export function PressableScale({
  children,
  style,
  containerStyle,
  scaleTo,
  dim = false,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: PressableScaleProps) {
  const { tokens } = useTheme();
  const reduceMotion = useReducedMotion();
  const [scale] = useState(() => new Animated.Value(1));
  const [opacity] = useState(() => new Animated.Value(1));
  const target = scaleTo ?? tokens.motion.pressScale;

  const animateTo = (pressed: boolean) => {
    const animations = [
      Animated.timing(opacity, {
        toValue: pressed && dim ? 0.82 : 1,
        duration: tokens.motion.fast.durationMs,
        useNativeDriver: true,
      }),
    ];
    if (!reduceMotion) {
      animations.push(
        pressed
          ? Animated.timing(scale, {
              toValue: target,
              duration: tokens.motion.fast.durationMs,
              useNativeDriver: true,
            })
          : Animated.spring(scale, {
              toValue: 1,
              damping: tokens.motion.spring.damping,
              stiffness: tokens.motion.spring.stiffness,
              mass: tokens.motion.spring.mass,
              useNativeDriver: true,
            }),
      );
    }
    Animated.parallel(animations).start();
  };

  return (
    <Pressable
      disabled={disabled}
      style={containerStyle}
      onPressIn={(e: GestureResponderEvent) => {
        animateTo(true);
        onPressIn?.(e);
      }}
      onPressOut={(e: GestureResponderEvent) => {
        animateTo(false);
        onPressOut?.(e);
      }}
      {...rest}>
      <Animated.View style={[style, { transform: [{ scale }], opacity }]}>{children}</Animated.View>
    </Pressable>
  );
}
