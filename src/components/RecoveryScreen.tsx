import { StyleSheet, Text, View } from 'react-native';

import { SecondaryButton } from '@/components/SecondaryButton';
import { makeStyles, typeStyle } from '@/theme/styles';

export interface RecoveryScreenProps {
  onRetry: () => void;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: t.space.s4,
      padding: t.space.s6,
      backgroundColor: t.bg.page,
    },
    title: typeStyle(t.type.h1, t.text.primary),
    body: { ...typeStyle(t.type.body, t.text.secondary), textAlign: 'center' },
  }),
);

/** Blocking migration-failure recovery screen (ERROR_HANDLING.md §7, DATA_FLOW.md §1.2). */
export function RecoveryScreen({ onRetry }: RecoveryScreenProps) {
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Couldn't open your data</Text>
      <Text style={styles.body}>
        Motrack couldn't prepare its database. Your data has not been touched. Try again, or
        contact support if this keeps happening.
      </Text>
      <SecondaryButton label="Retry" onPress={onRetry} />
    </View>
  );
}
