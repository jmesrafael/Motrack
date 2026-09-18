import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';

import { areBrandFontsLoaded } from './fonts';
import type { ThemeId } from './registry';
import { manropeFamily } from './themes/base';
import type { ShadowToken, ThemeTokens, TypeToken, TypeWeight } from './types';
import { useTheme } from './useTheme';

const FAMILY_BY_WEIGHT: Record<TypeWeight, keyof NonNullable<ThemeTokens['type']['family']>> = {
  '400': 'regular',
  '500': 'medium',
  '600': 'semibold',
  '700': 'bold',
  '800': 'extrabold',
};

/**
 * Expands a typography token into a TextStyle — the one place type tokens map
 * to RN. Defaults to the brand family (manropeFamily) so every call site gets
 * it for free; pass `null` explicitly to force the platform system font.
 * When the brand font isn't registered yet we fall back to fontWeight
 * (Android would otherwise synthesize a second bold on top of a system font).
 */
export function typeStyle(
  token: TypeToken,
  color: string,
  family: ThemeTokens['type']['family'] | undefined = manropeFamily,
): TextStyle {
  const style: TextStyle = {
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    color,
  };
  if (family !== null && areBrandFontsLoaded()) {
    style.fontFamily = family[FAMILY_BY_WEIGHT[token.fontWeight]];
    style.fontWeight = 'normal';
  } else {
    style.fontWeight = token.fontWeight;
  }
  if (token.letterSpacing !== undefined) {
    style.letterSpacing = token.letterSpacing;
  }
  if (token.uppercase === true) {
    style.textTransform = 'uppercase';
  }
  return style;
}

/** Tabular numerals for anything that counts (km, money, scores). */
export const tabular: TextStyle = { fontVariant: ['tabular-nums'] };

/** Spreads a ShadowToken (or nothing when the theme has none). */
export function shadow(token: ShadowToken | null): ViewStyle {
  return token === null ? {} : { ...token };
}

/** Glass material: translucent fill + hairline border + top highlight. */
export function glass(t: ThemeTokens, strong = false): ViewStyle {
  return {
    backgroundColor: strong ? t.glass.fillStrong : t.glass.fill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: t.glass.border,
    borderTopColor: t.glass.highlight,
  };
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
