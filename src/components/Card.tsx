import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { PressableScale } from '@/components/PressableScale';
import { glass, makeStyles, shadow } from '@/theme/styles';

export type CardVariant = 'surface' | 'glass' | 'hero' | 'outline' | 'tinted';

export interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  /** Removes inner padding for row lists that manage their own (ListSection). */
  flush?: boolean;
  variant?: CardVariant;
  /** Larger radius for hero/feature cards. */
  size?: 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    card: {
      borderRadius: t.radius.lg,
      padding: t.space.s4,
      overflow: 'hidden',
    },
    lg: { borderRadius: t.radius.xl, padding: t.space.s5 },
    flush: { padding: 0 },
    surface: {
      backgroundColor: t.bg.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border.divider,
      ...shadow(t.elevation.card),
    },
    glass: glass(t),
    hero: {
      backgroundColor: t.primary.base,
      ...shadow(t.elevation.accent),
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: t.border.strong,
    },
    tinted: {
      backgroundColor: t.primary.bg,
    },
  }),
);

/**
 * Surface container. `surface` is the default card; `glass` floats over
 * content (sheets, nav, overlays); `hero` is the accent statement card;
 * `outline`/`tinted` are quieter alternatives. Pressable cards get the shared
 * press feel from PressableScale.
 */
export function Card({
  children,
  onPress,
  accessibilityLabel,
  flush = false,
  variant = 'surface',
  size = 'md',
  style,
}: CardProps) {
  const styles = useStyles();
  const cardStyle = [styles.card, size === 'lg' && styles.lg, styles[variant], flush && styles.flush, style];

  if (onPress === undefined) {
    return <View style={cardStyle}>{children}</View>;
  }

  return (
    <PressableScale
      onPress={onPress}
      dim
      scaleTo={0.985}
      accessibilityRole="button"
      {...(accessibilityLabel !== undefined ? { accessibilityLabel } : {})}
      style={cardStyle}>
      {children}
    </PressableScale>
  );
}
