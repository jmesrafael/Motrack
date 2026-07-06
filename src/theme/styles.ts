import { StyleSheet, type TextStyle } from 'react-native';

import type { ThemeId } from './registry';
import type { ThemeTokens, TypeToken } from './types';
import { useTheme } from './useTheme';

/** Expands a typography token into a TextStyle — the one place type tokens map to RN. */
export function typeStyle(token: TypeToken, color: string): TextStyle {
  const style: TextStyle = {
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    fontWeight: token.fontWeight,
    color,
  };
  if (token.letterSpacing !== undefined) {
    style.letterSpacing = token.letterSpacing;
  }
  if (token.uppercase === true) {
    style.textTransform = 'uppercase';
  }
  return style;
}

/**
 * makeStyles((t) => StyleSheet.create({...})) — memoized per themeId so style
 * objects stay referentially stable across renders (PERFORMANCE.md §4).
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (tokens: ThemeTokens) => T,
): () => T {
  const cache = new Map<ThemeId, T>();
  return function useStyles(): T {
    const { tokens, themeId } = useTheme();
    const cached = cache.get(themeId);
    if (cached !== undefined) {
      return cached;
    }
    const created = factory(tokens);
    cache.set(themeId, created);
    return created;
  };
}
