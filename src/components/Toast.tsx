import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/Icon';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { glass, makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

/**
 * Lightweight, app-wide toast system for confirmations ("Maintenance saved",
 * "Motorcycle updated", "Settings saved"). Call `showToast()` from anywhere —
 * services, screens, stores — no provider wiring needed at call sites.
 * `<ToastHost />` is mounted once, in the root layout.
 */

export type ToastKind = 'success' | 'info' | 'warning' | 'error';

export interface ToastOptions {
  message: string;
  kind?: ToastKind;
  /** ms before auto-dismiss; 0 disables auto-dismiss. */
  durationMs?: number;
}

interface ToastEntry extends Required<ToastOptions> {
  id: number;
}

type Listener = (entry: ToastEntry) => void;
let listener: Listener | null = null;
let seq = 0;

export function showToast(options: ToastOptions | string): void {
  const opts: ToastOptions = typeof options === 'string' ? { message: options } : options;
  const entry: ToastEntry = {
    id: seq++,
    message: opts.message,
    kind: opts.kind ?? 'success',
    durationMs: opts.durationMs ?? 2600,
  };
  listener?.(entry);
}

const KIND_ICON: Record<ToastKind, IconName> = {
  success: 'statusGood',
  info: 'lightbulb',
  warning: 'statusDueSoon',
  error: 'statusOverdue',
};

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: {
      position: 'absolute',
      left: t.space.gutter,
      right: t.space.gutter,
      alignItems: 'center',
    },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s2,
      borderRadius: t.radius.full,
      paddingVertical: t.space.s3,
      paddingHorizontal: t.space.s4,
      maxWidth: 460,
      width: '100%',
      ...glass(t, true),
    },
    message: { ...typeStyle(t.type.bodyStrong, t.text.primary, t.type.family), flex: 1 },
  }),
);

const KIND_COLOR_KEY: Record<ToastKind, 'success' | 'info' | 'warning' | 'error'> = {
  success: 'success',
  info: 'info',
  warning: 'warning',
  error: 'error',
};

function ToastCard({ entry, onDone }: { entry: ToastEntry; onDone: (id: number) => void }) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const reduceMotion = useReducedMotion();
  const [y] = useState(() => new Animated.Value(16));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(y, { toValue: 0, duration: reduceMotion ? 0 : 220, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: reduceMotion ? 0 : 220, useNativeDriver: true }),
    ]).start();

    const dismiss = () => {
      Animated.parallel([
        Animated.timing(y, { toValue: 16, duration: reduceMotion ? 0 : 180, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: reduceMotion ? 0 : 180, useNativeDriver: true }),
      ]).start(() => onDone(entry.id));
    };

    if (entry.durationMs > 0) {
      const timer = setTimeout(dismiss, entry.durationMs);
      return () => clearTimeout(timer);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const color = tokens.feedback[KIND_COLOR_KEY[entry.kind]].base;

  return (
    <Animated.View style={[styles.toast, { transform: [{ translateY: y }], opacity, marginBottom: 8 }]}>
      <Icon name={KIND_ICON[entry.kind]} size={tokens.iconSize.listLeading} color={color} />
      <Text style={styles.message} numberOfLines={2}>
        {entry.message}
      </Text>
    </Animated.View>
  );
}

export function ToastHost() {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<ToastEntry[]>([]);

  useEffect(() => {
    listener = (entry) => {
      setEntries((prev) => [...prev.slice(-2), entry]);
    };
    return () => {
      listener = null;
    };
  }, []);

  const remove = (id: number) => setEntries((prev) => prev.filter((e) => e.id !== id));

  if (entries.length === 0) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={[styles.root, { bottom: insets.bottom + 78 }]}>
      {entries.map((entry) => (
        <ToastCard key={entry.id} entry={entry} onDone={remove} />
      ))}
    </View>
  );
}
