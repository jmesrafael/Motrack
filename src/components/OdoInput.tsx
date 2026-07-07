import { StyleSheet, Text, TextInput, View } from 'react-native';

import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface OdoInputProps {
  value: string;
  onChange: (value: string) => void;
  lastReadingKm?: number;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { gap: t.space.s1 },
    input: {
      minHeight: 56,
      borderRadius: t.radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border.divider,
      backgroundColor: t.bg.input,
      paddingHorizontal: t.space.s4,
      color: t.text.primary,
      fontSize: t.type.h1.fontSize,
      fontVariant: ['tabular-nums'],
    },
    caption: typeStyle(t.type.caption, t.text.tertiary),
  }),
);

/** Odometer entry: big keypad, tabular numerals (COMPONENT_LIBRARY.md). */
export function OdoInput({ value, onChange, lastReadingKm }: OdoInputProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  return (
    <View style={styles.root}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={tokens.text.placeholder}
        accessibilityLabel="Odometer, kilometers"
      />
      {lastReadingKm !== undefined ? (
        <Text style={styles.caption}>last: {lastReadingKm.toLocaleString('en-PH')} km</Text>
      ) : null}
    </View>
  );
}
