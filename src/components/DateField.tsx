import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { parseIsoDate, toIsoDate } from '@/lib/dates';
import { formatMonthDay } from '@/lib/format';
import { makeStyles, typeStyle } from '@/theme/styles';

export interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
  maxIso?: string;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    trigger: {
      minHeight: 44,
      justifyContent: 'center',
      borderRadius: t.radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border.divider,
      backgroundColor: t.bg.input,
      paddingHorizontal: t.space.s3,
    },
    text: typeStyle(t.type.body, t.text.primary),
  }),
);

/** Opens the native date picker; displays a localized date (COMPONENT_LIBRARY.md). */
export function DateField({ value, onChange, maxIso }: DateFieldProps) {
  const styles = useStyles();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Date: ${value}`}
        style={styles.trigger}>
        <Text style={styles.text}>{formatMonthDay(value)}</Text>
      </Pressable>
      {open ? (
        <DateTimePicker
          value={parseIsoDate(value)}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          {...(maxIso !== undefined ? { maximumDate: parseIsoDate(maxIso) } : {})}
          onChange={(_event, date) => {
            setOpen(false);
            if (date !== undefined) {
              onChange(toIsoDate(date));
            }
          }}
        />
      ) : null}
    </>
  );
}
