import { useState } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Icon } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { parseIsoDate, toIsoDate } from '@/lib/dates';
import { formatMonthDay } from '@/lib/format';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
  maxIso?: string;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s2,
      minHeight: t.size.input,
      borderRadius: t.radius.sm,
      backgroundColor: t.bg.input,
      paddingHorizontal: t.space.s4,
    },
    text: typeStyle(t.type.body, t.text.primary, t.type.family),
  }),
);

/** Opens the native date picker; displays a localized date. */
export function DateField({ value, onChange, maxIso }: DateFieldProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <PressableScale
        onPress={() => setOpen(true)}
        scaleTo={0.98}
        accessibilityRole="button"
        accessibilityLabel={`Date: ${value}`}
        style={styles.trigger}>
        <Icon name="calendarClock" size={tokens.iconSize.inline} color={tokens.icon.secondary} />
        <Text style={styles.text}>{formatMonthDay(value)}</Text>
      </PressableScale>
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
