import { create } from 'zustand';

import { THEME_PREFERENCES, type ThemePreference } from '@/theme/registry';

interface SettingsState {
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
  /** Steps system → light → dark → system (validation-phase switcher, S-30 picker later). */
  cycleThemePreference: () => void;
}

/**
 * Validation phase: in-memory only. Real persistence goes through SQLite
 * `app_settings` via SettingsRepository (STATE_MANAGEMENT.md §5) — no SQLite
 * is allowed in this phase, so hydration lands with T-101.
 */
export const useSettingsStore = create<SettingsState>((set, get) => ({
  themePreference: 'system',
  setThemePreference: (preference) => set({ themePreference: preference }),
  cycleThemePreference: () => {
    const current = get().themePreference;
    const index = THEME_PREFERENCES.indexOf(current);
    const next = THEME_PREFERENCES[(index + 1) % THEME_PREFERENCES.length];
    if (next !== undefined) {
      set({ themePreference: next });
    }
  },
}));
