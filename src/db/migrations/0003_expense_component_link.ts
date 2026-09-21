/**
 * Migration 0003 — lets a standalone expense optionally link to the
 * maintenance component it was for (Dashboard Quick Logs component detail,
 * item 11's "Expense logs" section). Purely additive: existing expenses get
 * NULL, meaning "not linked to a specific component," same as before.
 */

export const migration0003: readonly string[] = [
  `ALTER TABLE expenses ADD COLUMN schedule_id TEXT REFERENCES maintenance_schedules(id) ON DELETE SET NULL`,
  `CREATE INDEX idx_expenses_schedule ON expenses (schedule_id) WHERE schedule_id IS NOT NULL`,
];
