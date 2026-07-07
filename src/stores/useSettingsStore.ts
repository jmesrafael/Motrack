import { create } from 'zustand';

import { SettingsRepository } from '@/db/repositories/SettingsRepository';
import { emitDomainEvent } from '@/lib/events';
import { THEME_PREFERENCES, type ThemePreference } from '@/theme/registry';

const THEME_KEY = 'theme';
const LANGUAGE_KEY = 'language';

export type LanguagePreference = 'system' | 'en' | 'fil';

interface SettingsState {
  themePreference: ThemePreference;
  language: LanguagePreference;
  hydrated: boolean;
  /** Loads persisted settings from SQLite — startup sequence step 4 (DATA_FLOW.md §1). */
  hydrate: () => void;
  setThemePreference: (preference: ThemePreference) => void;
  setLanguage: (language: LanguagePreference) => void;
  /** Steps system → light → dark → system (dashboard quick switcher). */
  cycleThemePreference: () => void;
}

/**
 * The only persisted store — mirrored to SQLite `app_settings`, never
 * AsyncStorage (STATE_MANAGEMENT.md §5).
 */
export const useSettingsStore = create<SettingsState>((set, get) => ({
  themePreference: 'system',
  language: 'system',
  hydrated: false,
  hydrate: () => {
    const theme = SettingsRepository.get<ThemePreference>(THEME_KEY, 'system');
    const language = SettingsRepository.get<LanguagePreference>(LANGUAGE_KEY, 'system');
    set({
      themePreference: THEME_PREFERENCES.includes(theme) ? theme : 'system',
      language,
      hydrated: true,
    });
  },
  setThemePreference: (preference) => {
    SettingsRepository.set(THEME_KEY, preference);
    set({ themePreference: preference });
    emitDomainEvent('settings:changed');
  },
  setLanguage: (language) => {
    SettingsRepository.set(LANGUAGE_KEY, language);
    set({ language });
    emitDomainEvent('settings:changed');
  },
  cycleThemePreference: () => {
    const current = get().themePreference;
    const index = THEME_PREFERENCES.indexOf(current);
    const next = THEME_PREFERENCES[(index + 1) % THEME_PREFERENCES.length];
    if (next !== undefined) {
      get().setThemePreference(next);
    }
  },
}));
