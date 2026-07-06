import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { makeStyles } from '@/theme/styles';

export interface ScreenProps {
  children: ReactNode;
  /** Scrolling content (default); false for fixed layouts like empty states. */
  scroll?: boolean;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.bg.page,
    },
    content: {
      paddingHorizontal: t.space.s4,
      paddingBottom: t.space.s6,
      gap: t.space.s4,
    },
    fixed: {
      flex: 1,
      paddingHorizontal: t.space.s4,
    },
  }),
);

export function Screen({ children, scroll = true }: ScreenProps) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();

  if (!scroll) {
    return (
      <View style={styles.root}>
        <View style={[styles.fixed, { paddingTop: insets.top }]}>{children}</View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
}
