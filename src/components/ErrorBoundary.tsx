import { Component, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { PrimaryButton } from '@/components/PrimaryButton';
import { log } from '@/lib/log';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
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
      backgroundColor: t.feedback.warning.bg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: t.space.s2,
    },
    title: { ...typeStyle(t.type.h1, t.text.primary, t.type.family), textAlign: 'center' },
    body: { ...typeStyle(t.type.body, t.text.secondary, t.type.family), textAlign: 'center', maxWidth: 320 },
    // Same centered container as title/body (maxWidth 320, centered by root's
    // alignItems) instead of alignSelf:'stretch', which ignored that centering
    // and pinned the button to root's full, unconstrained edge-to-edge width.
    cta: { alignSelf: 'center', width: '100%', maxWidth: 320, marginTop: t.space.s2 },
  }),
);

function Fallback({ onRestart }: { onRestart: () => void }) {
  const styles = useStyles();
  const { tokens } = useTheme();
  return (
    <View style={styles.root}>
      <View style={styles.iconWell}>
        <Icon name="statusDueSoon" size={tokens.iconSize.feature} color={tokens.feedback.warning.base} />
      </View>
      <Text style={styles.title}>Something broke</Text>
      <Text style={styles.body}>Your data is safe. Try restarting this screen.</Text>
      <View style={styles.cta}>
        <PrimaryButton label="Restart" onPress={onRestart} />
      </View>
    </View>
  );
}

/** Root/per-tab crash boundary (ERROR_HANDLING.md §3.4) — friendly fallback, never a blank screen. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error): void {
    log.error('errorBoundary.caught', { message: error.message });
  }

  override render() {
    if (this.state.hasError) {
      return <Fallback onRestart={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}
