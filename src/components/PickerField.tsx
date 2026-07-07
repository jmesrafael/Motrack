import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { makeStyles, typeStyle } from '@/theme/styles';

export interface PickerOption<T extends string> {
  value: T;
  label: string;
}

export interface PickerFieldProps<T extends string> {
  options: readonly PickerOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  placeholder: string;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    trigger: {
      minHeight: 44,
      borderRadius: t.radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border.divider,
      backgroundColor: t.bg.input,
      paddingHorizontal: t.space.s3,
      justifyContent: 'center',
    },
    triggerText: typeStyle(t.type.body, t.text.primary),
    placeholder: typeStyle(t.type.body, t.text.placeholder),
    backdrop: {
      flex: 1,
      backgroundColor: t.overlay.scrim,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: t.bg.sheet,
      borderTopLeftRadius: t.radius.lg,
      borderTopRightRadius: t.radius.lg,
      maxHeight: '70%',
      paddingBottom: t.space.s6,
    },
    row: {
      minHeight: 48,
      paddingHorizontal: t.space.s5,
      justifyContent: 'center',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.border.divider,
    },
    rowText: typeStyle(t.type.body, t.text.primary),
    rowActive: { backgroundColor: t.bg.surfaceVariant },
  }),
);

/** Bottom-sheet single-select — plain Modal implementation (COMPONENT_LIBRARY.md scope note). */
export function PickerField<T extends string>({
  options,
  value,
  onChange,
  placeholder,
}: PickerFieldProps<T>) {
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={selected?.label ?? placeholder}
        style={styles.trigger}>
        <Text style={selected !== undefined ? styles.triggerText : styles.placeholder}>
          {selected?.label ?? placeholder}
        </Text>
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: item.value === value }}
                  style={[styles.row, item.value === value && styles.rowActive]}>
                  <Text style={styles.rowText}>{item.label}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
