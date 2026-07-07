/**
 * The log facade (LOGGING_GUIDE.md) — the only place console.* is allowed.
 * Context values must be ids/counts/enums, never user content (§3).
 */

type LogContext = Record<string, string | number | boolean | null | undefined>;

const isDev = __DEV__;

export const log = {
  debug(message: string, context?: LogContext): void {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(`[debug] ${message}`, context ?? '');
    }
  },
  info(message: string, context?: LogContext): void {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(`[info] ${message}`, context ?? '');
    }
  },
  warn(message: string, context?: LogContext): void {
    // eslint-disable-next-line no-console
    console.warn(`[warn] ${message}`, context ?? '');
  },
  error(message: string, context?: LogContext): void {
    // eslint-disable-next-line no-console
    console.error(`[error] ${message}`, context ?? '');
  },
};
