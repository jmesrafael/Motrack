import { useContext } from 'react';

import { ThemeContext, type ThemeContextValue } from './ThemeProvider';

/** The one consumption hook — components read tokens only through this (THEME_GUIDE.md §2). */
export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (value === null) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return value;
}
