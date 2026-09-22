import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';

/**
 * Startup gate — shown only while the database opens and brand fonts load
 * (typically under a second). Deliberately uses only tokens.* colors, no
 * typeStyle(), since it must render correctly before font-load state settles.
 */
export function AppLoadingScreen() {
  const { tokens } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: tokens.bg.page }]}>
      <View style={[styles.mark, { backgroundColor: tokens.primary.base }]} />
      <Text style={[styles.word, { color: tokens.text.primary }]}>Tolits</Text>
      <ActivityIndicator color={tokens.primary.base} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  mark: { width: 40, height: 40, borderRadius: 12 },
  word: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  spinner: { marginTop: 16 },
});
