/**
 * Shared repository helpers (SQLITE_GUIDE.md §2): id/created_at at insert,
 * updated_at on every write, DbError wrapping (ERROR_HANDLING.md §3.1).
 */

import { nowMs } from '@/lib/dates';
import { newUuid } from '@/lib/uuid';

export class DbError extends Error {
  constructor(
    readonly operation: string,
    cause: unknown,
  ) {
    super(`DB operation failed: ${operation} (${String(cause)})`);
  }
}

export interface SyncMeta {
  id: string;
  createdAt: number;
  updatedAt: number;
  deletedAt: null;
}

export function insertMeta(): SyncMeta {
  const at = nowMs();
  return { id: newUuid(), createdAt: at, updatedAt: at, deletedAt: null };
}

export function touchMeta(): { updatedAt: number } {
  return { updatedAt: nowMs() };
}

export function softDeleteMeta(): { deletedAt: number; updatedAt: number } {
  const at = nowMs();
  return { deletedAt: at, updatedAt: at };
}

/** Wraps driver exceptions in DbError with query context, never user data. */
export function guard<T>(operation: string, fn: () => T): T {
  try {
    return fn();
  } catch (cause) {
    if (cause instanceof DbError) {
      throw cause;
    }
    throw new DbError(operation, cause);
  }
}
