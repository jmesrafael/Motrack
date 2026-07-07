import { migration0001 } from './0001_initial';

export interface Migration {
  version: number;
  name: string;
  statements: readonly string[];
}

/**
 * Numbered, append-only, forward-only (ADR-022). `PRAGMA user_version`
 * mirrors the highest applied version (DATABASE_DESIGN.md §8.6).
 */
export const MIGRATIONS: readonly Migration[] = [
  { version: 1, name: 'initial', statements: migration0001 },
];
