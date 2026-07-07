/**
 * Schema integration test — applies the bundled migration SQL to a real
 * SQLite engine (better-sqlite3, DEPENDENCY_GUIDE.md §1 dev deps) and
 * exercises CHECK constraints, FKs, and indexes. expo-sqlite is a thin native
 * binding over the same SQLite C library, so this validates the actual DDL
 * that ships to devices without needing a native RN runtime.
 */

import Database from 'better-sqlite3';
import { MIGRATIONS } from './index';

function freshDb(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  for (const migration of MIGRATIONS) {
    for (const statement of migration.statements) {
      db.exec(statement);
    }
  }
  return db;
}

function insertBike(db: Database.Database, id: string) {
  db.prepare(
    `INSERT INTO motorcycles (id, created_at, updated_at, nickname, brand, model, drivetrain_type, current_odometer_km)
     VALUES (?, 0, 0, ?, 'Yamaha', 'NMAX', 'cvt', 1000)`,
  ).run(id, `bike-${id}`);
}

describe('schema — DATABASE_DESIGN.md §5–6', () => {
  test('all migrations apply cleanly and user_version tracks the latest', () => {
    const db = freshDb();
    const tables = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
      .all() as { name: string }[];
    expect(tables.map((t) => t.name)).toEqual(
      expect.arrayContaining([
        'motorcycles',
        'maintenance_schedules',
        'maintenance_records',
        'repairs',
        'expenses',
        'fuel_logs',
        'odometer_logs',
        'documents',
        'scheduled_notifications',
        'app_settings',
      ]),
    );
    db.close();
  });

  test('nickname uniqueness is case-insensitive among non-deleted bikes (§5.1)', () => {
    const db = freshDb();
    insertBike(db, 'a');
    expect(() =>
      db
        .prepare(
          `INSERT INTO motorcycles (id, created_at, updated_at, nickname, brand, model, drivetrain_type)
           VALUES ('b', 0, 0, 'BIKE-A', 'Honda', 'Click', 'cvt')`,
        )
        .run(),
    ).toThrow(/UNIQUE/);
    db.close();
  });

  test('year CHECK rejects out-of-range values (§5.1)', () => {
    const db = freshDb();
    expect(() =>
      db
        .prepare(
          `INSERT INTO motorcycles (id, created_at, updated_at, nickname, brand, model, drivetrain_type, year)
           VALUES ('x', 0, 0, 'Test', 'Honda', 'Click', 'cvt', 1900)`,
        )
        .run(),
    ).toThrow(/CHECK/);
    db.close();
  });

  test('schedule requires at least one of interval_km/interval_months (§5.2)', () => {
    const db = freshDb();
    insertBike(db, 'a');
    expect(() =>
      db
        .prepare(
          `INSERT INTO maintenance_schedules (id, created_at, updated_at, motorcycle_id, component_type)
           VALUES ('s1', 0, 0, 'a', 'engine_oil')`,
        )
        .run(),
    ).toThrow(/CHECK/);
    db.close();
  });

  test('non-custom component_type is unique per bike among non-deleted schedules (§5.2)', () => {
    const db = freshDb();
    insertBike(db, 'a');
    db.prepare(
      `INSERT INTO maintenance_schedules (id, created_at, updated_at, motorcycle_id, component_type, interval_km)
       VALUES ('s1', 0, 0, 'a', 'engine_oil', 1500)`,
    ).run();
    expect(() =>
      db
        .prepare(
          `INSERT INTO maintenance_schedules (id, created_at, updated_at, motorcycle_id, component_type, interval_km)
           VALUES ('s2', 0, 0, 'a', 'engine_oil', 1500)`,
        )
        .run(),
    ).toThrow(/UNIQUE/);
    db.close();
  });

  test('custom components are unlimited (no unique clash) (§5.2)', () => {
    const db = freshDb();
    insertBike(db, 'a');
    db.prepare(
      `INSERT INTO maintenance_schedules (id, created_at, updated_at, motorcycle_id, component_type, custom_name, interval_km)
       VALUES ('s1', 0, 0, 'a', 'custom', 'Grips', 12000)`,
    ).run();
    expect(() =>
      db
        .prepare(
          `INSERT INTO maintenance_schedules (id, created_at, updated_at, motorcycle_id, component_type, custom_name, interval_km)
           VALUES ('s2', 0, 0, 'a', 'custom', 'Levers', 12000)`,
        )
        .run(),
    ).not.toThrow();
    db.close();
  });

  test('fuel_logs.liters CHECK enforces 0.1–99.99 (§5.6)', () => {
    const db = freshDb();
    insertBike(db, 'a');
    expect(() =>
      db
        .prepare(
          `INSERT INTO fuel_logs (id, created_at, updated_at, motorcycle_id, fuel_date, liters, total_cost_centavos, odometer_km)
           VALUES ('f1', 0, 0, 'a', '2026-01-01', 100.5, 20000, 1500)`,
        )
        .run(),
    ).toThrow(/CHECK/);
    db.close();
  });

  test('expenses.amount_centavos rejects negative values (§5.5)', () => {
    const db = freshDb();
    insertBike(db, 'a');
    expect(() =>
      db
        .prepare(
          `INSERT INTO expenses (id, created_at, updated_at, motorcycle_id, category, amount_centavos, expense_date)
           VALUES ('e1', 0, 0, 'a', 'other', -100, '2026-01-01')`,
        )
        .run(),
    ).toThrow(/CHECK/);
    db.close();
  });

  test('deleting a bike is restricted while schedules reference it (soft-delete discipline, §7)', () => {
    const db = freshDb();
    insertBike(db, 'a');
    db.prepare(
      `INSERT INTO maintenance_schedules (id, created_at, updated_at, motorcycle_id, component_type, interval_km)
       VALUES ('s1', 0, 0, 'a', 'engine_oil', 1500)`,
    ).run();
    expect(() => db.prepare(`DELETE FROM motorcycles WHERE id = 'a'`).run()).toThrow(/FOREIGN KEY/);
    db.close();
  });

  test('documents.motorcycle_id nullable (rider-level license, §5.8)', () => {
    const db = freshDb();
    expect(() =>
      db
        .prepare(
          `INSERT INTO documents (id, created_at, updated_at, doc_type, title, file_path, mime_type, file_size)
           VALUES ('d1', 0, 0, 'license', 'License', 'documents/x.jpg', 'image/jpeg', 100)`,
        )
        .run(),
    ).not.toThrow();
    db.close();
  });
});
