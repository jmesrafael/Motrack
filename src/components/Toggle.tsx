import { Switch, StyleSheet, Text, View } from 'react-native';

import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 44,
      paddingHorizontal: t.space.s4,
      paddingVertical: t.space.s2,
    },
    label: typeStyle(t.type.body, t.text.primary),
  }),
);

export function Toggle({ value, onChange, label }: ToggleProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: tokens.primary.base, false: tokens.bg.surfaceVariant }}
        accessibilityLabel={label}
      />
    </View>
  );
}
