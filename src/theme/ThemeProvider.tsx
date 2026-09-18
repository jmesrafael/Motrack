import { createContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Animated, StyleSheet, useColorScheme } from 'react-native';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { THEMES, isThemeId, type ThemeId, type ThemePreference } from './registry';
import type { ThemeBase, ThemeTokens } from './types';

export interface ThemeContextValue {
  tokens: ThemeTokens;
  themeId: ThemeId;
  /** Light-or-dark family — for the engine only, never for feature branching (THEME_GUIDE.md §3). */
  base: ThemeBase;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Resolves preference → registered theme and cross-dissolves on change: an
 * overlay painted in the OUTGOING theme's page color fades out over
 * motion.base while the new tokens render beneath. Pure context swap — never
 * keys/remounts the tree, so navigation, scroll and form state survive.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const preference = useSettingsStore((s) => s.themePreference);
  const setPreference = useSettingsStore((s) => s.setThemePreference);
  const isReducedMotion = useReducedMotion();

  // Unknown/retired persisted id falls back to system — never crash on a stale setting.
  const themeId: ThemeId =
    preference !== 'system' && isThemeId(preference)
      ? preference
      : systemScheme === 'light'
        ? 'light'
        : 'dark';

  const definition = THEMES[themeId];

  const previousRef = useRef<{ themeId: ThemeId; pageColor: string }>({
    themeId,
    pageColor: definition.tokens.bg.page,
  });
  const [fadeOpacity] = useState(() => new Animated.Value(0));
  // State (not a ref) so the overlay color is read during render legally.
  const [overlayColor, setOverlayColor] = useState(definition.tokens.bg.page);

  useEffect(() => {
    const previous = previousRef.current;
    if (previous.themeId !== themeId) {
      setOverlayColor(previous.pageColor);
      previousRef.current = { themeId, pageColor: definition.tokens.bg.page };
      if (!isReducedMotion) {
        fadeOpacity.setValue(1);
        Animated.timing(fadeOpacity, {
          toValue: 0,
          duration: definition.tokens.motion.slow.durationMs,
          useNativeDriver: false,
        }).start();
      }
    }
  }, [themeId, definition, fadeOpacity, isReducedMotion]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      tokens: definition.tokens,
      themeId,
      base: definition.base,
      preference,
      setPreference,
    }),
    [definition, themeId, preference, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: overlayColor, opacity: fadeOpacity }]}
      />
    </ThemeContext.Provider>
  );
}
