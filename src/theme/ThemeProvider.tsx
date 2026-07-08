import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

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

interface FadeOverlayProps {
  color: string;
  durationMs: number;
  onDone: () => void;
}

/** Outgoing theme's bg.page fading 1 → 0 — opacity-only, native driver (ANIMATION_GUIDE.md §3). */
function FadeOverlay({ color, durationMs, onDone }: FadeOverlayProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(
      0,
      { duration: durationMs, easing: Easing.inOut(Easing.ease) },
      (finished) => {
        if (finished === true) {
          runOnJS(onDone)();
        }
      },
    );
    // Runs once per overlay mount; a new transition remounts via key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: color }, style]}
    />
  );
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

  // Render-phase derivation (not an effect): the overlay appears in the same
  // paint as the new tokens, so the dissolve starts with no unthemed flash.
  const [previous, setPrevious] = useState({ themeId, pageColor: definition.tokens.bg.page });
  const [transition, setTransition] = useState<{ fromColor: string; key: string } | null>(null);
  if (previous.themeId !== themeId) {
    setPrevious({ themeId, pageColor: definition.tokens.bg.page });
    if (!isReducedMotion) {
      setTransition({ fromColor: previous.pageColor, key: `${previous.themeId}->${themeId}` });
    }
  }

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
      {transition !== null ? (
        <FadeOverlay
          key={transition.key}
          color={transition.fromColor}
          durationMs={definition.tokens.motion.base.durationMs}
          onDone={() => setTransition(null)}
        />
      ) : null}
    </ThemeContext.Provider>
  );
}
