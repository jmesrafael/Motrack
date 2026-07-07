import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavDefaultTheme,
  ThemeProvider as NavThemeProvider,
} from 'expo-router';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RecoveryScreen } from '@/components/RecoveryScreen';
import { initDatabase } from '@/db/client';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTutorialStore } from '@/stores/useTutorialStore';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { useTheme } from '@/theme/useTheme';
import { TutorialHost } from '@/tutorial/ui/TutorialHost';

/** Maps tokens → React Navigation theme so chrome re-themes with everything else. */
function ThemedNavigation() {
  const { tokens, base } = useTheme();
  const navBase = base === 'dark' ? NavDarkTheme : NavDefaultTheme;

  return (
    <NavThemeProvider
      value={{
        ...navBase,
        colors: {
          ...navBase.colors,
          primary: tokens.primary.base,
          background: tokens.bg.page,
          card: tokens.bg.nav,
          text: tokens.text.primary,
          border: tokens.border.divider,
          notification: tokens.feedback.error.base,
        },
      }}>
      <StatusBar style={base === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="pending" options={{ presentation: 'modal' }} />
      </Stack>
    </NavThemeProvider>
  );
}

/**
 * Startup sequence (DATA_FLOW.md §1): open DB + apply migrations, then hydrate
 * settings, before first navigation render. Migration failure blocks with the
 * recovery screen (ERROR_HANDLING.md §7) — never a half-migrated app.
 */
function useStartup() {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const hydrate = useSettingsStore((s) => s.hydrate);
  const hydrateTutorial = useTutorialStore((s) => s.hydrate);

  const attempt = () => {
    setFailed(false);
    try {
      initDatabase();
      hydrate();
      hydrateTutorial();
      setReady(true);
    } catch {
      setFailed(true);
    }
  };

  useEffect(attempt, []);

  return { ready, failed, retry: attempt };
}

function StartupGate() {
  const { ready, failed, retry } = useStartup();

  if (failed) {
    return <RecoveryScreen onRetry={retry} />;
  }
  if (!ready) {
    return null;
  }
  return (
    <ErrorBoundary>
      <ThemedNavigation />
      <TutorialHost />
    </ErrorBoundary>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <StartupGate />
    </ThemeProvider>
  );
}
