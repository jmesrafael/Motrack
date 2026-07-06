import { Pressable, StyleSheet, Text } from 'react-native';

import { makeStyles, typeStyle } from '@/theme/styles';

export interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    button: {
      minHeight: 44,
      paddingHorizontal: t.space.s4,
      borderRadius: t.radius.full,
      borderWidth: 1,
      borderColor: t.border.strong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: typeStyle(t.type.bodyStrong, t.text.primary),
  }),
);

export function SecondaryButton({ label, onPress }: SecondaryButtonProps) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}
