import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { glass, makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  /** Numeric badge (reminders bell). */
  badge?: number;
  variant?: 'surface' | 'glass' | 'ghost' | 'accent';
  size?: 'md' | 'sm';
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    base: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: t.radius.full,
    },
    md: { width: t.size.iconWell, height: t.size.iconWell },
    sm: { width: t.size.iconWellSm, height: t.size.iconWellSm },
    surface: {
      backgroundColor: t.bg.surfaceVariant,
    },
    glass: glass(t),
    ghost: { backgroundColor: 'transparent' },
    accent: { backgroundColor: t.primary.base },
    badge: {
      position: 'absolute',
      top: -2,
      right: -2,
      minWidth: 18,
      height: 18,
      borderRadius: t.radius.full,
      backgroundColor: t.feedback.error.base,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
      borderWidth: 2,
      borderColor: t.bg.page,
    },
    badgeText: {
      ...typeStyle(t.type.label, '#FFFFFF', t.type.family),
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 0,
    },
  }),
);

/** Round 44pt icon control — header actions, back buttons, row affordances. */
export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  badge,
  variant = 'surface',
  size = 'md',
  color,
  style,
}: IconButtonProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const iconColor = color ?? (variant === 'accent' ? tokens.primary.on : tokens.icon.primary);

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.92}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.base, styles[size], styles[variant], style]}>
      <Icon name={icon} size={size === 'sm' ? tokens.iconSize.listLeading : tokens.iconSize.md} color={iconColor} />
      {badge !== undefined && badge > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : String(badge)}</Text>
        </View>
      ) : null}
    </PressableScale>
  );
}
