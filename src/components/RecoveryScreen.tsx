import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { PrimaryButton } from '@/components/PrimaryButton';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

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
    iconWell: {
      width: 84,
      height: 84,
      borderRadius: t.radius.xl,
      backgroundColor: t.feedback.error.bg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: t.space.s2,
    },
    title: { ...typeStyle(t.type.h1, t.text.primary, t.type.family), textAlign: 'center' },
    body: {
      ...typeStyle(t.type.body, t.text.secondary, t.type.family),
      textAlign: 'center',
      maxWidth: 320,
    },
    // Same centered container as title/body (maxWidth, centered by root's
    // alignItems) instead of alignSelf:'stretch', which ignored that centering
    // and pinned the button to root's full, unconstrained edge-to-edge width.
    cta: { alignSelf: 'center', width: '100%', maxWidth: 320, marginTop: t.space.s2 },
  }),
);

/** Blocking migration-failure recovery screen (ERROR_HANDLING.md §7, DATA_FLOW.md §1.2). */
export function RecoveryScreen({ onRetry }: RecoveryScreenProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  return (
    <View style={styles.root}>
      <View style={styles.iconWell}>
        <Icon name="statusOverdue" size={tokens.iconSize.feature} color={tokens.feedback.error.base} />
      </View>
      <Text style={styles.title}>Couldn&apos;t open your data</Text>
      <Text style={styles.body}>
        Motrack couldn&apos;t prepare its database. Your data has not been touched. Try again, or contact support if
        this keeps happening.
      </Text>
      <View style={styles.cta}>
        <PrimaryButton label="Retry" onPress={onRetry} />
      </View>
    </View>
  );
}
