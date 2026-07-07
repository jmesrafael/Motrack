import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { appSettings } from '@/db/schema';
import { nowMs } from '@/lib/dates';
import { guard } from './base';

/**
 * Key-value settings over `app_settings` (DATABASE_DESIGN.md §5.10). Values
 * are JSON-encoded; unknown/corrupt values fall back to the caller's default
 * (never crash on a stale setting — BUSINESS_RULES.md §10).
 */
export const SettingsRepository = {
  get<T>(key: string, fallback: T): T {
    return guard('settings.get', () => {
      const row = db
        .select({ value: appSettings.value })
        .from(appSettings)
        .where(eq(appSettings.key, key))
        .get();
      if (row === undefined) {
        return fallback;
      }
      try {
        return JSON.parse(row.value) as T;
      } catch {
        return fallback;
      }
    });
  },

  set(key: string, value: unknown): void {
    guard('settings.set', () =>
      db
        .insert(appSettings)
        .values({ key, value: JSON.stringify(value), updatedAt: nowMs() })
        .onConflictDoUpdate({
          target: appSettings.key,
          set: { value: JSON.stringify(value), updatedAt: nowMs() },
        })
        .run(),
    );
  },

  remove(key: string): void {
    guard('settings.remove', () => db.delete(appSettings).where(eq(appSettings.key, key)).run());
  },
};
