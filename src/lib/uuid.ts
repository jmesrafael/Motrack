import * as Crypto from 'expo-crypto';

/** UUIDv4 generated on device — TEXT primary keys everywhere (ADR-006). */
export function newUuid(): string {
  return Crypto.randomUUID();
}
