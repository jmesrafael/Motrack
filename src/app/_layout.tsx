import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavDefaultTheme,
  ThemeProvider as NavThemeProvider,
} from 'expo-router';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider } from '@/theme/ThemeProvider';
import { useTheme } from '@/theme/useTheme';

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
        <Stack.Screen name="pending" options={{ presentation: 'modal' }} />
      </Stack>
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ThemedNavigation />
    </ThemeProvider>
  );
}
