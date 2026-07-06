import type { ThemeDefinition } from './types';
import { darkTheme } from './themes/dark';
import { lightTheme } from './themes/light';

/**
 * The ONLY place themes are registered (THEME_GUIDE.md §2). Adding a theme =
 * one token file under themes/ + one entry here; pickers and tests iterate
 * this record, so nothing else changes (THEME_GUIDE.md §5).
 */
export const THEMES = {
  light: lightTheme,
  dark: darkTheme,
} as const satisfies Record<string, ThemeDefinition>;

export type ThemeId = keyof typeof THEMES;

export type ThemePreference = 'system' | ThemeId;

export const THEME_PREFERENCES: readonly ThemePreference[] = [
  'system',
  ...(Object.keys(THEMES) as ThemeId[]),
];

export function isThemeId(value: string): value is ThemeId {
  return value in THEMES;
}
