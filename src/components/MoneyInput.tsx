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
      minHeight: 44,
      borderRadius: t.radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border.divider,
      backgroundColor: t.bg.input,
      paddingHorizontal: t.space.s3,
    },
    prefix: typeStyle(t.type.bodyStrong, t.text.secondary),
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
  return (
    <View style={styles.row}>
      <Text style={styles.prefix}>₱</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^0-9.]/g, ''))}
        keyboardType="decimal-pad"
        placeholder="0.00"
        placeholderTextColor={tokens.text.placeholder}
        accessibilityLabel="Amount, pesos"
      />
    </View>
  );
}
