/**
 * Exercises the restore staging-import logic (RestoreService.ts's
 * buildStagingDatabase/insertRows) against the real migration SQL via
 * better-sqlite3 (same rationale as db/migrations/schema.integration.test.ts:
 * expo-sqlite is a thin binding over the same SQLite C library). This can't
 * import RestoreService.ts directly (it pulls in expo-sqlite/expo-file-system
 * native modules), so it re-implements the same column-derived INSERT shape
 * using the shared, pure `columnsFor` helper — the part most likely to break
 * silently (column typos, wrong order, missing NOT NULL values).
 */

import Database from 'better-sqlite3';
import { MIGRATIONS } from '@/db/migrations';
import { columnsFor } from './backupData';
import { BACKUP_TABLE_ORDER, type BackupTableName } from './validation/backupSchemas';

function freshDb(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = OFF');
  for (const migration of MIGRATIONS) {
    for (const statement of migration.statements) {
      db.exec(statement);
    }
  }
  return db;
}

/** Mirrors RestoreService.insertRows: builds the INSERT from columnsFor() and runs it. */
function insertRows(db: Database.Database, table: BackupTableName, rows: Record<string, unknown>[]): void {
  if (rows.length === 0) {
    return;
  }
  const columns = columnsFor(table);
  const placeholders = columns.map(() => '?').join(', ');
  const stmt = db.prepare(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`);
  for (const row of rows) {
    stmt.run(columns.map((c) => row[c]));
  }
}

const syncCols = { created_at: 0, updated_at: 0, deleted_at: null };

function fullFixture(): Record<BackupTableName, Record<string, unknown>[]> {
  return {
    motorcycles: [
      {
        id: 'b1',
        ...syncCols,
        nickname: 'Red Click',
        brand: 'Honda',
        model: 'Click',
        year: 2022,
        drivetrain_type: 'cvt',
        photo_path: null,
        plate_number: null,
        vin: null,
        engine_number: null,
        purchase_date: null,
        purchase_price_centavos: null,
        current_odometer_km: 5000,
        odometer_offset_km: 0,
        is_archived: 0,
        sort_order: 0,
      },
    ],
    maintenance_schedules: [
      {
        id: 's1',
        ...syncCols,
        motorcycle_id: 'b1',
        component_type: 'engine_oil',
        custom_name: null,
        interval_km: 1500,
        interval_months: null,
        is_enabled: 1,
        is_muted: 0,
        snoozed_until: null,
        anchor_odometer_km: 4000,
        anchor_date: null,
        anchor_source: 'record',
      },
    ],
    maintenance_records: [
      {
        id: 'r1',
        ...syncCols,
        motorcycle_id: 'b1',
        schedule_id: 's1',
        performed_date: '2026-01-01',
        odometer_km: 4000,
        service_type: 'replace',
        cost_centavos: 15000,
        brand: null,
        quantity: null,
        details: null,
        notes: null,
        photo_path: null,
        source: 'user',
      },
    ],
    repairs: [
      {
        id: 'p1',
        ...syncCols,
        motorcycle_id: 'b1',
        title: 'Fix carb',
        repair_date: '2026-01-05',
        odometer_km: 4100,
        problem: 'idle',
        diagnosis: null,
        solution: null,
        shop_name: null,
        cost_centavos: 50000,
        photo_paths: null,
        notes: null,
      },
    ],
    expenses: [
      {
        id: 'e1',
        ...syncCols,
        motorcycle_id: 'b1',
        category: 'parking',
        amount_centavos: 2000,
        expense_date: '2026-01-02',
        notes: null,
        photo_path: null,
      },
    ],
    fuel_logs: [
      {
        id: 'f1',
        ...syncCols,
        motorcycle_id: 'b1',
        fuel_date: '2026-01-03',
        liters: 5.5,
        total_cost_centavos: 30000,
        odometer_km: 4050,
        station: null,
        is_full_tank: 1,
        notes: null,
      },
    ],
    odometer_logs: [
      {
        id: 'o1',
        ...syncCols,
        motorcycle_id: 'b1',
        reading_km: 4000,
        effective_km: 4000,
        recorded_date: '2026-01-01',
        source: 'manual',
        source_id: null,
      },
    ],
    documents: [
      {
        id: 'd1',
        ...syncCols,
        motorcycle_id: 'b1',
        doc_type: 'orcr',
        title: 'OR/CR',
        file_path: 'documents/d1.jpg',
        mime_type: 'image/jpeg',
        file_size: 12345,
        expiry_date: '2027-01-01',
        notes: null,
      },
    ],
  };
}

describe('restore staging import — column-derived INSERT against the real schema', () => {
  test('every table accepts a well-formed row using columnsFor() ordering', () => {
    const db = freshDb();
    const fixture = fullFixture();
    for (const table of BACKUP_TABLE_ORDER) {
      expect(() => insertRows(db, table, fixture[table])).not.toThrow();
    }
    for (const table of BACKUP_TABLE_ORDER) {
      const row = db.prepare(`SELECT * FROM ${table}`).get() as Record<string, unknown>;
      expect(row.id).toBe(fixture[table][0]!.id);
    }
    db.close();
  });

  test('round-trips soft-deleted rows too (restore must not drop them)', () => {
    const db = freshDb();
    const fixture = fullFixture();
    fixture.motorcycles[0]!.deleted_at = 12345;
    for (const table of BACKUP_TABLE_ORDER) {
      insertRows(db, table, fixture[table]);
    }
    const row = db.prepare(`SELECT deleted_at FROM motorcycles WHERE id = 'b1'`).get() as {
      deleted_at: number;
    };
    expect(row.deleted_at).toBe(12345);
    db.close();
  });

  test('passes PRAGMA quick_check and foreign_key_check after a full import', () => {
    const db = freshDb();
    const fixture = fullFixture();
    for (const table of BACKUP_TABLE_ORDER) {
      insertRows(db, table, fixture[table]);
    }
    const quickCheck = db.prepare('PRAGMA quick_check').all() as Record<string, string>[];
    expect(quickCheck).toHaveLength(1);
    expect(Object.values(quickCheck[0]!)[0]).toBe('ok');

    db.pragma('foreign_keys = ON');
    const fkViolations = db.prepare('PRAGMA foreign_key_check').all();
    expect(fkViolations).toEqual([]);
    db.close();
  });

  test('a row violating a CHECK constraint still throws (integrity net is real, not bypassed)', () => {
    const db = freshDb();
    const fixture = fullFixture();
    fixture.expenses[0]!.amount_centavos = -500; // violates the amount_centavos >= 0 CHECK
    insertRows(db, 'motorcycles', fixture.motorcycles);
    expect(() => insertRows(db, 'expenses', fixture.expenses)).toThrow(/CHECK/);
    db.close();
  });

  test('inserting a child table before its parent violates the FK (proves table order matters)', () => {
    const db = freshDb();
    db.pragma('foreign_keys = ON');
    const fixture = fullFixture();
    expect(() => insertRows(db, 'maintenance_schedules', fixture.maintenance_schedules)).toThrow(
      /FOREIGN KEY/,
    );
    db.close();
  });
});
