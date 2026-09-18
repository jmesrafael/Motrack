import { ActivityIndicator, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { makeStyles, shadow, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'soft';
export type ButtonSize = 'lg' | 'md' | 'sm';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  /** Stretch to the container width (default true for lg, false otherwise). */
  block?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: t.space.s2,
      borderRadius: t.radius.full,
      paddingHorizontal: t.space.s5,
    },
    lg: { minHeight: t.size.buttonLg, paddingHorizontal: t.space.s6 },
    md: { minHeight: t.size.buttonMd },
    sm: { minHeight: 36, paddingHorizontal: t.space.s4 },
    block: { alignSelf: 'stretch' },
    inline: { alignSelf: 'flex-start' },
    primary: { backgroundColor: t.primary.base, ...shadow(t.elevation.accent) },
    secondary: {
      backgroundColor: t.bg.surfaceVariant,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border.divider,
    },
    ghost: { backgroundColor: 'transparent' },
    destructive: {
      backgroundColor: t.feedback.error.bg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.feedback.error.base,
    },
    soft: { backgroundColor: t.primary.bg },
    disabled: { backgroundColor: t.state.disabledBg, shadowOpacity: 0, elevation: 0, borderColor: 'transparent' },
    labelLg: typeStyle(t.type.bodyStrong, t.text.primary, t.type.family),
    labelMd: typeStyle(t.type.bodyStrong, t.text.primary, t.type.family),
    labelSm: typeStyle(t.type.captionStrong, t.text.primary, t.type.family),
  }),
);

/**
 * The button. Variants map to intent, not color:
 * primary = the one next action, secondary = alternative, ghost = tertiary,
 * destructive = irreversible, soft = accent-tinted secondary.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  loading = false,
  disabled = false,
  block,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const isDisabled = disabled || loading;
  const isBlock = block ?? size === 'lg';

  const color = isDisabled
    ? tokens.state.disabledText
    : variant === 'primary'
      ? tokens.primary.on
      : variant === 'destructive'
        ? tokens.feedback.error.base
        : variant === 'soft'
          ? tokens.primary.text
          : variant === 'ghost'
            ? tokens.text.secondary
            : tokens.text.primary;

  const labelStyle = size === 'lg' ? styles.labelLg : size === 'md' ? styles.labelMd : styles.labelSm;

  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.base,
        styles[size],
        styles[variant],
        isBlock ? styles.block : styles.inline,
        isDisabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.space.s2 }}>
          {icon !== undefined ? (
            <Icon name={icon} size={size === 'sm' ? tokens.iconSize.inline : tokens.iconSize.listLeading} color={color} />
          ) : null}
          <Text style={[labelStyle, { color }]}>{label}</Text>
        </View>
      )}
    </PressableScale>
  );
}
