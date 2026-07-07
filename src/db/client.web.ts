/**
 * Web shim for the native SQLite client.
 *
 * expo-sqlite's synchronous web worker can block app startup in Expo web dev.
 * The production data layer is native-first, so web avoids opening SQLite at
 * module import time and fails clearly only if a DB-backed feature is executed.
 */

export class WebDatabaseUnavailableError extends Error {
  constructor(operation: string) {
    super(`SQLite is not available on web for ${operation}`);
  }
}

function unavailable(operation: string): never {
  throw new WebDatabaseUnavailableError(operation);
}

function createUnavailableProxy<T extends object>(name: string): T {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'then') {
          return undefined;
        }
        return () => unavailable(`${name}.${String(prop)}`);
      },
    },
  ) as T;
}

/** Placeholder Drizzle handle. Native builds use client.ts. */
export const db = createUnavailableProxy<Record<string, unknown>>('db');

/** Placeholder raw SQLite handle. Native builds use client.ts. */
export const rawDb = createUnavailableProxy<Record<string, unknown>>('rawDb');

/** Native transaction helper; unavailable for web-only SQLite calls. */
export function inTransaction<T>(_fn: () => T): T {
  return unavailable('inTransaction');
}

/** Web startup should not block on SQLite. */
export function initDatabase(): void {
  // no-op
}
