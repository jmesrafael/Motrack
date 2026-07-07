/**
 * Delete-all-data (S-33, DEVELOPMENT_RULES.md §14 — privacy by minimization,
 * "delete-all really deletes"). Hard-deletes every user-data row; unlike
 * normal mutations this bypasses soft delete by design.
 */

import { inTransaction, rawDb } from '@/db/client';
import { emitDomainEvent } from '@/lib/events';

const USER_DATA_TABLES = [
  'maintenance_records',
  'repairs',
  'expenses',
  'fuel_logs',
  'odometer_logs',
  'documents',
  'maintenance_schedules',
  'motorcycles',
  'scheduled_notifications',
];

export const DataPrivacyService = {
  deleteAllData(): void {
    inTransaction(() => {
      for (const table of USER_DATA_TABLES) {
        rawDb.execSync(`DELETE FROM ${table}`);
      }
      rawDb.execSync(`DELETE FROM app_settings WHERE key != 'schema_seed_version'`);
    });
    emitDomainEvent('bike:changed');
    emitDomainEvent('settings:changed');
  },
};
