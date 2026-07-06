import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { makeStyles } from '@/theme/styles';

export interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  /** Removes inner padding for row lists that manage their own (ListSection). */
  flush?: boolean;
  style?: StyleProp<ViewStyle>;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    card: {
      backgroundColor: t.bg.card,
      borderRadius: t.radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border.divider,
      padding: t.space.s4,
      overflow: 'hidden',
    },
    flush: {
      padding: 0,
    },
  }),
);

export function Card({ children, onPress, accessibilityLabel, flush = false, style }: CardProps) {
  const styles = useStyles();
  const cardStyle = [styles.card, flush && styles.flush, style];

  if (onPress === undefined) {
    return <View style={cardStyle}>{children}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      {...(accessibilityLabel !== undefined ? { accessibilityLabel } : {})}
      style={({ pressed }) => [...cardStyle, pressed && { opacity: 0.7 }]}>
      {children}
    </Pressable>
  );
}
