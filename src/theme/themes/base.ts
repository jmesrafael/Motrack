import type {
  ComponentSizeTokens,
  FontFamilyTokens,
  IconSizeTokens,
  MotionTokens,
  RadiusTokens,
  SpaceTokens,
  TypeTokens,
} from '../types';

/**
 * Shared non-color token groups — themes spread these and may override.
 * Typography follows the design board: Manrope, tight leading, heavy display
 * weights, uppercase eyebrow labels.
 */

/** Manrope as registered by src/theme/fonts.ts (null → system font fallback). */
export const manropeFamily: FontFamilyTokens = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
};

export const baseType: TypeTokens = {
  family: manropeFamily,
  hero: { fontSize: 30, lineHeight: 35, fontWeight: '800', letterSpacing: -0.6 },
  stat: { fontSize: 44, lineHeight: 48, fontWeight: '800', letterSpacing: -1 },
  display: { fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -0.5 },
  h1: { fontSize: 24, lineHeight: 30, fontWeight: '800', letterSpacing: -0.3 },
  h2: { fontSize: 19, lineHeight: 24, fontWeight: '700', letterSpacing: -0.2 },
  h3: { fontSize: 16, lineHeight: 21, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '500' },
  bodyStrong: { fontSize: 15, lineHeight: 21, fontWeight: '700' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  captionStrong: { fontSize: 13, lineHeight: 18, fontWeight: '700' },
  label: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 0.6, uppercase: true },
};

export const baseSpace: SpaceTokens = {
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 20,
  s6: 24,
  s8: 32,
  s10: 40,
  s12: 48,
  gutter: 20,
};

export const baseRadius: RadiusTokens = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  full: 999,
};

export const baseMotion: MotionTokens = {
  fast: { durationMs: 140 },
  base: { durationMs: 240 },
  slow: { durationMs: 420 },
  pressScale: 0.97,
  spring: { damping: 16, stiffness: 220, mass: 0.9 },
};

export const baseIconSize: IconSizeTokens = {
  inline: 16,
  listLeading: 20,
  md: 24,
  feature: 32,
  hero: 48,
};

export const baseSize: ComponentSizeTokens = {
  buttonLg: 54,
  buttonMd: 44,
  input: 50,
  row: 56,
  fab: 58,
  navHeight: 64,
  iconWell: 44,
  iconWellSm: 36,
};
