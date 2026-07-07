import type { ZodError, ZodType } from 'zod';

import { DbError } from '@/db/repositories/base';
import { log } from '@/lib/log';
import { appError, err, ok, type AppError, type Result } from '@/lib/result';

/** Zod error → ValidationError with field → issue-code map for inline form errors. */
export function fromZodError(error: ZodError): AppError {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path.join('.') || '_';
    if (fieldErrors[field] === undefined) {
      fieldErrors[field] = issue.message;
    }
  }
  return appError('ValidationError', 'validation.failed', 'Input validation failed', fieldErrors);
}

export function validateWith<T>(schema: ZodType<T>, input: unknown): Result<T> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return err(fromZodError(parsed.error));
  }
  return ok(parsed.data);
}

/**
 * Runs a mutation, mapping thrown DbError (repository layer) to a Result —
 * services never leak exceptions for expected failures (ERROR_HANDLING.md §3).
 */
export function guardService<T>(operation: string, fn: () => Result<T>): Result<T> {
  try {
    return fn();
  } catch (cause) {
    log.error(`${operation}.dbError`);
    if (cause instanceof DbError) {
      return err(appError('DbError', operation, cause.message));
    }
    throw cause;
  }
}
