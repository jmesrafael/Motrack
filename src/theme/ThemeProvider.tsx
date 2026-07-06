import { createContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
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
 * Resolves preference → registered theme (THEME_GUIDE.md §2) and cross-dissolves
 * on change: an overlay in the outgoing theme's bg.page fades 1 → 0 over
 * motion.base while the new tokens render beneath (THEME_GUIDE.md §4).
 * Pure context swap — never keys/remounts the tree, so navigation, scroll,
 * and form state survive by construction.
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
      : systemScheme === 'dark'
        ? 'dark'
        : 'light';

  const definition = THEMES[themeId];

  const previousRef = useRef<{ themeId: ThemeId; pageColor: string }>({
    themeId,
    pageColor: definition.tokens.bg.page,
  });
  const fadeOpacity = useRef(new Animated.Value(0)).current;
  const overlayColorRef = useRef(definition.tokens.bg.page);

  useEffect(() => {
    const previous = previousRef.current;
    if (previous.themeId !== themeId) {
      overlayColorRef.current = previous.pageColor;
      previousRef.current = { themeId, pageColor: definition.tokens.bg.page };
      if (!isReducedMotion) {
        fadeOpacity.setValue(1);
        Animated.timing(fadeOpacity, {
          toValue: 0,
          duration: definition.tokens.motion.base.durationMs,
          // Opacity-only; JS driver keeps behavior identical across native + web.
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
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: overlayColorRef.current, opacity: fadeOpacity },
        ]}
      />
    </ThemeContext.Provider>
  );
}
