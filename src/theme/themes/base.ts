import type {
  IconSizeTokens,
  MotionTokens,
  RadiusTokens,
  SpaceTokens,
  TypeTokens,
} from '../types';

/**
 * Shared non-color token groups (THEME_GUIDE.md §2) — themes spread these and
 * may override (e.g. a future high-contrast theme raising weights).
 * Values: DESIGN_SYSTEM.md §4–§5, ANIMATION_GUIDE.md §2, ICON_GUIDE.md §2.
 */

export const baseType: TypeTokens = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '700' },
  h1: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  h2: { fontSize: 19, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  label: { fontSize: 11, lineHeight: 14, fontWeight: '600', letterSpacing: 0.5, uppercase: true },
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
};

export const baseRadius: RadiusTokens = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 999,
};

export const baseMotion: MotionTokens = {
  fast: { durationMs: 150 },
  base: { durationMs: 250 },
  slow: { durationMs: 400 },
};

export const baseIconSize: IconSizeTokens = {
  inline: 16,
  listLeading: 20,
  md: 24,
  feature: 32,
};
