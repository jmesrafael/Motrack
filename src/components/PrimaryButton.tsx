import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    button: {
      minHeight: 48,
      paddingHorizontal: t.space.s5,
      borderRadius: t.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.primary.base,
    },
    disabled: {
      backgroundColor: t.state.disabledBg,
    },
    label: typeStyle(t.type.bodyStrong, '#fff'),
  }),
);

export function PrimaryButton({ label, onPress, loading = false, disabled = false }: PrimaryButtonProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.disabled,
        pressed && !isDisabled && { opacity: 0.85 },
      ]}>
      {loading ? (
        <ActivityIndicator color={tokens.primary.on} />
      ) : (
        <Text style={[styles.label, { color: tokens.primary.on }]}>{label}</Text>
      )}
    </Pressable>
  );
}
