import { Pressable, StyleSheet, Text, View } from 'react-native';

import { makeStyles, typeStyle } from '@/theme/styles';

export interface Segment<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  segments: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      backgroundColor: t.bg.surfaceVariant,
      borderRadius: t.radius.full,
      padding: 3,
    },
    segment: {
      flex: 1,
      minHeight: 38,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: t.radius.full,
    },
    active: {
      backgroundColor: t.bg.card,
    },
    label: typeStyle(t.type.bodyStrong, t.text.secondary),
    activeLabel: {
      color: t.text.primary,
    },
  }),
);

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const styles = useStyles();
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {segments.map((segment) => {
        const active = segment.value === value;
        return (
          <Pressable
            key={segment.value}
            onPress={() => onChange(segment.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            style={[styles.segment, active && styles.active]}>
            <Text style={[styles.label, active && styles.activeLabel]}>{segment.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
