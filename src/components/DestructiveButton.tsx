import { Pressable, StyleSheet, Text } from 'react-native';

import { makeStyles, typeStyle } from '@/theme/styles';

export interface DestructiveButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    button: {
      minHeight: 44,
      paddingHorizontal: t.space.s4,
      borderRadius: t.radius.full,
      borderWidth: 1,
      borderColor: t.feedback.error.base,
      alignItems: 'center',
      justifyContent: 'center',
    },
    disabled: { opacity: 0.5 },
    label: typeStyle(t.type.bodyStrong, t.feedback.error.base),
  }),
);

export function DestructiveButton({ label, onPress, disabled = false }: DestructiveButtonProps) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.button, disabled && styles.disabled, pressed && !disabled && { opacity: 0.7 }]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}
