/**
 * Result pattern + AppError taxonomy (ERROR_HANDLING.md §2–4).
 * Services return Result; they never throw for expected failures.
 */

export type AppErrorKind =
  | 'ValidationError'
  | 'BusinessRuleError'
  | 'DbError'
  | 'FileError'
  | 'NotificationError'
  | 'MigrationError'
  | 'CorruptionError';

export interface AppError {
  kind: AppErrorKind;
  /** Stable machine-greppable code, e.g. 'odometer.belowLast' (LOGGING_GUIDE.md §2). */
  code: string;
  /** English developer message; UI maps `code` to localized copy. */
  message: string;
  /** Field-level errors for forms: field name → error code. */
  fieldErrors?: Record<string, string>;
}

export type Result<T, E = AppError> = { ok: true; value: T } | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function appError(
  kind: AppErrorKind,
  code: string,
  message: string,
  fieldErrors?: Record<string, string>,
): AppError {
  const error: AppError = { kind, code, message };
  if (fieldErrors !== undefined) {
    error.fieldErrors = fieldErrors;
  }
  return error;
}

export function unwrapOr<T>(result: Result<T>, fallback: T): T {
  return result.ok ? result.value : fallback;
}
