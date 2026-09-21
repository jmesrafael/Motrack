import * as Localization from 'expo-localization';
import { useMemo } from 'react';

import { useSettingsStore, type LanguagePreference } from '@/stores/useSettingsStore';
import { deepMerge } from './deepMerge';
import { fil } from './locales/fil';
import { strings as en } from './strings';

export type Locale = 'en' | 'fil';

/** Device language at first run only — 'system' is resolved live on every read, never baked into a stored value. */
function detectDeviceLocale(): Locale {
  try {
    const code = Localization.getLocales()[0]?.languageCode;
    return code === 'fil' || code === 'tl' ? 'fil' : 'en';
  } catch {
    return 'en';
  }
}

export function resolveLocale(preference: LanguagePreference): Locale {
  if (preference === 'en' || preference === 'fil') {
    return preference;
  }
  return detectDeviceLocale();
}

/**
 * Reactive localized dictionary, merged from English (complete) and Tagalog
 * (partial — see locales/fil.ts for what's covered so far). Components that
 * render onboarding, setup, tour chrome, or Help & Tutorials copy should read
 * strings through this hook rather than the static `strings` export so a
 * language change re-renders them immediately.
 */
export function useStrings(): typeof en {
  const preference = useSettingsStore((s) => s.language);
  return useMemo(() => {
    const locale = resolveLocale(preference);
    return locale === 'fil' ? deepMerge(en, fil) : en;
  }, [preference]);
}

export function useLocale(): Locale {
  const preference = useSettingsStore((s) => s.language);
  return resolveLocale(preference);
}
