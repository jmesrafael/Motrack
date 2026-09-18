import { useEffect, useState } from 'react';
import { Animated, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { makeStyles, shadow, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

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
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: t.size.input,
      borderRadius: t.radius.sm,
      backgroundColor: t.bg.input,
      paddingHorizontal: t.space.s4,
      justifyContent: 'space-between',
    },
    triggerText: typeStyle(t.type.body, t.text.primary, t.type.family),
    placeholder: typeStyle(t.type.body, t.text.placeholder, t.type.family),
    backdrop: {
      flex: 1,
      backgroundColor: t.overlay.scrimSoft,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: t.bg.sheet,
      borderTopLeftRadius: t.radius.xl,
      borderTopRightRadius: t.radius.xl,
      maxHeight: '70%',
      paddingBottom: t.space.s6,
      paddingTop: t.space.s2,
      ...shadow(t.elevation.sheet),
    },
    grabber: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.border.strong,
      alignSelf: 'center',
      marginVertical: t.space.s2,
    },
    row: {
      minHeight: 52,
      paddingHorizontal: t.space.s5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rowText: typeStyle(t.type.body, t.text.primary, t.type.family),
    rowActiveText: typeStyle(t.type.bodyStrong, t.primary.text, t.type.family),
    rowActive: { backgroundColor: t.primary.bg },
  }),
);

/** Bottom-sheet single-select with a spring entrance. */
export function PickerField<T extends string>({
  options,
  value,
  onChange,
  placeholder,
}: PickerFieldProps<T>) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [y] = useState(() => new Animated.Value(400));
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (open) {
      y.setValue(400);
      Animated.spring(y, {
        toValue: 0,
        damping: 18,
        stiffness: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [open, y]);

  const close = () => {
    Animated.timing(y, { toValue: 400, duration: reduceMotion ? 0 : 180, useNativeDriver: true }).start(() =>
      setOpen(false),
    );
  };

  return (
    <>
      <PressableScale
        onPress={() => setOpen(true)}
        scaleTo={0.98}
        accessibilityRole="button"
        accessibilityLabel={selected?.label ?? placeholder}
        style={styles.trigger}>
        <Text style={selected !== undefined ? styles.triggerText : styles.placeholder}>
          {selected?.label ?? placeholder}
        </Text>
        <Icon name="chevronDown" size={tokens.iconSize.inline} color={tokens.icon.secondary} />
      </PressableScale>
      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close}>
          <Animated.View style={[styles.sheet, { transform: [{ translateY: y }] }]}>
            <View style={styles.grabber} />
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item.value);
                    close();
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: item.value === value }}
                  style={[styles.row, item.value === value && styles.rowActive]}>
                  <Text style={item.value === value ? styles.rowActiveText : styles.rowText}>{item.label}</Text>
                  {item.value === value ? (
                    <Icon name="check" size={tokens.iconSize.inline} color={tokens.primary.text} />
                  ) : null}
                </Pressable>
              )}
            />
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}
