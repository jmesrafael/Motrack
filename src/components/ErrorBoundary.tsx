import { Component, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SecondaryButton } from '@/components/SecondaryButton';
import { log } from '@/lib/log';
import { makeStyles, typeStyle } from '@/theme/styles';

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
    title: typeStyle(t.type.h1, t.text.primary),
    body: { ...typeStyle(t.type.body, t.text.secondary), textAlign: 'center' },
  }),
);

function Fallback({ onRestart }: { onRestart: () => void }) {
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Something broke</Text>
      <Text style={styles.body}>Your data is safe. Try restarting this screen.</Text>
      <SecondaryButton label="Restart" onPress={onRestart} />
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
