/**
 * Browser-backed settings repository.
 *
 * Native persists settings in SQLite. Web uses localStorage so app startup,
 * theme selection, and tutorial progress can run without expo-sqlite's sync
 * worker path.
 */

const PREFIX = 'motrack:setting:';

function storage(): Storage | null {
  return typeof window === 'undefined' ? null : window.localStorage;
}

export const SettingsRepository = {
  get<T>(key: string, fallback: T): T {
    const store = storage();
    if (store === null) {
      return fallback;
    }
    const raw = store.getItem(`${PREFIX}${key}`);
    if (raw === null) {
      return fallback;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  set(key: string, value: unknown): void {
    storage()?.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  },

  remove(key: string): void {
    storage()?.removeItem(`${PREFIX}${key}`);
  },
};
