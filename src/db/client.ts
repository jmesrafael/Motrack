/**
 * DB open/init/migration gate (DATA_FLOW.md §1). One long-lived connection,
 * WAL + foreign keys per SQLITE_GUIDE.md §1. `initDatabase()` must resolve
 * before any query runs — the root layout gates rendering on it.
 */

import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';

import { nowMs } from '@/lib/dates';
import { log } from '@/lib/log';
import { MIGRATIONS } from './migrations';
import { SEED_VERSION } from './seed/defaults';

const DB_NAME = 'motrack.db';

const sqlite: SQLiteDatabase = openDatabaseSync(DB_NAME);

/** The one Drizzle instance — imported by repositories only. */
export const db = drizzle(sqlite);

/** Raw handle for pragmas and service-owned transactions (SQLITE_GUIDE.md §4). */
export const rawDb = sqlite;

/** Runs `fn` inside a SQLite transaction; nested calls join the outer transaction. */
export function inTransaction<T>(fn: () => T): T {
  let result: T | undefined;
  sqlite.withTransactionSync(() => {
    result = fn();
  });
  return result as T;
}

let initialized = false;

export class MigrationFailure extends Error {
  constructor(
    readonly version: number,
    cause: unknown,
  ) {
    super(`Migration ${version} failed: ${String(cause)}`);
  }
}

/**
 * Startup sequence steps 2–3 (DATA_FLOW.md §1): pragmas → pending migrations
 * (each in a transaction, user_version updated with it) → seed version marker.
 * Throws MigrationFailure — caller shows the blocking recovery screen
 * (ERROR_HANDLING.md §7); never a half-migrated app.
 */
export function initDatabase(): void {
  if (initialized) {
    return;
  }

  sqlite.execSync('PRAGMA journal_mode = WAL');
  sqlite.execSync('PRAGMA foreign_keys = ON');
  sqlite.execSync('PRAGMA busy_timeout = 5000');

  const row = sqlite.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version <= currentVersion) {
      continue;
    }
    const startedAt = nowMs();
    try {
      sqlite.withTransactionSync(() => {
        for (const statement of migration.statements) {
          sqlite.execSync(statement);
        }
        sqlite.execSync(`PRAGMA user_version = ${migration.version}`);
      });
      log.info('db.migration.applied', {
        version: migration.version,
        durationMs: nowMs() - startedAt,
      });
    } catch (cause) {
      log.error('db.migration.failed', { version: migration.version });
      throw new MigrationFailure(migration.version, cause);
    }
  }

  seedVersionMarker();
  initialized = true;
}

/** Records the seed config version (DATABASE_DESIGN.md §9); defaults apply to new bikes only. */
function seedVersionMarker(): void {
  sqlite.runSync(
    `INSERT INTO app_settings (key, value, updated_at) VALUES ('schema_seed_version', ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    [JSON.stringify(SEED_VERSION), nowMs()],
  );
}
