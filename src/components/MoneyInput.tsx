import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface MoneyInputProps {
  /** Displayed value as pesos-and-centavos text, e.g. "450.00". */
  value: string;
  onChange: (value: string) => void;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: t.size.input,
      borderRadius: t.radius.sm,
      borderWidth: 1.5,
      borderColor: 'transparent',
      backgroundColor: t.bg.input,
      paddingHorizontal: t.space.s4,
    },
    focused: {
      borderColor: t.border.focus,
      backgroundColor: t.bg.inputFocused,
    },
    prefix: typeStyle(t.type.bodyStrong, t.text.secondary, t.type.family),
    input: {
      flex: 1,
      marginLeft: t.space.s1,
      color: t.text.primary,
      fontSize: t.type.body.fontSize,
      fontVariant: ['tabular-nums'],
    },
  }),
);

/** ₱ prefix money entry; caller converts to centavos on submit (ADR-008). */
export function MoneyInput({ value, onChange }: MoneyInputProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.row, focused && styles.focused]}>
      <Text style={styles.prefix}>₱</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^0-9.]/g, ''))}
        keyboardType="decimal-pad"
        placeholder="0.00"
        placeholderTextColor={tokens.text.placeholder}
        accessibilityLabel="Amount, pesos"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}
