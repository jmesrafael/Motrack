import * as Localization from 'expo-localization';
import { useMemo } from 'react';

import { useSettingsStore, type LanguagePreference } from '@/stores/useSettingsStore';
import { deepMerge } from './deepMerge';
import { fil } from './locales/fil';
import { id } from './locales/id';
import { th } from './locales/th';
import { vi } from './locales/vi';
import { strings as en } from './strings';

export type Locale = 'en' | 'fil' | 'vi' | 'id' | 'th';

const LOCALE_OVERRIDES: Partial<Record<Locale, unknown>> = {
  fil,
  vi,
  id,
  th,
};

/** Device language at first run only — 'system' is resolved live on every read, never baked into a stored value. */
function detectDeviceLocale(): Locale {
  try {
    const code = Localization.getLocales()[0]?.languageCode;
    if (code === 'fil' || code === 'tl') return 'fil';
    if (code === 'vi' || code === 'id' || code === 'th') return code;
    return 'en';
  } catch {
    return 'en';
  }
}

export function resolveLocale(preference: LanguagePreference): Locale {
  if (preference === 'en' || preference === 'fil' || preference === 'vi' || preference === 'id' || preference === 'th') {
    return preference;
  }
  return detectDeviceLocale();
}

/**
 * Reactive localized dictionary, merged from English (complete) and each
 * locale's partial overrides (see locales/*.ts for what's covered so far).
 * Components that render onboarding, setup, tour chrome, or Help & Tutorials
 * copy should read strings through this hook rather than the static
 * `strings` export so a language change re-renders them immediately.
 */
export function useStrings(): typeof en {
  const preference = useSettingsStore((s) => s.language);
  return useMemo(() => {
    const locale = resolveLocale(preference);
    const override = LOCALE_OVERRIDES[locale];
    return override ? deepMerge(en, override) : en;
  }, [preference]);
}

export function useLocale(): Locale {
  const preference = useSettingsStore((s) => s.language);
  return resolveLocale(preference);
}
