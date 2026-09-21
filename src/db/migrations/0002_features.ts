/**
 * Migration 0002 — schema additions for Dashboard Quick Logs, Custom
 * Component ordering, free-form expense categories + images + Builds, and
 * richer Documents (number/link/extra images). Additive only: every existing
 * column, row and CHECK that isn't explicitly discussed below is preserved.
 *
 * `expenses` is the one table rebuilt in place (SQLite has no `ALTER ... DROP
 * CONSTRAINT`, so relaxing the `category` CHECK — needed for user-added
 * categories — requires the create-copy-drop-rename sequence). The legacy
 * single `photo_path` column is folded into the new `images` JSON array so no
 * previously-attached expense photo is lost; `category` values are copied
 * byte-for-byte, including existing `'fuel'` rows, which keeps them fully
 * readable even though the category picker no longer offers 'fuel' for new
 * entries (BUSINESS_RULES.md: legacy category is display-only, never deleted).
 */

export const migration0002: readonly string[] = [
  // --- Maintenance: Dashboard Quick Logs pinning + Custom Component ordering ---
  `ALTER TABLE maintenance_schedules ADD COLUMN is_pinned INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE maintenance_schedules ADD COLUMN pinned_sort_order INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE maintenance_schedules ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0`,

  // --- Documents: number/link fields + additional images beyond the first file ---
  `ALTER TABLE documents ADD COLUMN document_number TEXT`,
  `ALTER TABLE documents ADD COLUMN link TEXT`,
  `ALTER TABLE documents ADD COLUMN extra_files TEXT`,

  // --- Builds ---
  `CREATE TABLE builds (
    id TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER,
    motorcycle_id TEXT NOT NULL REFERENCES motorcycles(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT,
    cover_photo TEXT,
    budget_centavos INTEGER CHECK (budget_centavos IS NULL OR budget_centavos >= 0),
    sort_order INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX idx_builds_bike ON builds (motorcycle_id)`,

  // --- expenses rebuild: free-form category, multi-image, optional Build link ---
  `CREATE TABLE expenses_new (
    id TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER,
    motorcycle_id TEXT NOT NULL REFERENCES motorcycles(id) ON DELETE RESTRICT,
    category TEXT NOT NULL,
    amount_centavos INTEGER NOT NULL CHECK (amount_centavos >= 0),
    expense_date TEXT NOT NULL,
    notes TEXT,
    images TEXT,
    build_id TEXT REFERENCES builds(id) ON DELETE SET NULL
  )`,
  `INSERT INTO expenses_new (id, created_at, updated_at, deleted_at, motorcycle_id, category, amount_centavos, expense_date, notes, images, build_id)
     SELECT id, created_at, updated_at, deleted_at, motorcycle_id, category, amount_centavos, expense_date, notes,
            CASE WHEN photo_path IS NOT NULL THEN json_array(photo_path) ELSE NULL END,
            NULL
       FROM expenses`,
  `DROP TABLE expenses`,
  `ALTER TABLE expenses_new RENAME TO expenses`,
  `CREATE INDEX idx_expenses_bike_date ON expenses (motorcycle_id, expense_date DESC)`,
  `CREATE INDEX idx_expenses_build ON expenses (build_id) WHERE build_id IS NOT NULL`,

  // --- Build plan items (future upgrades) ---
  `CREATE TABLE build_plan_items (
    id TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER,
    build_id TEXT NOT NULL REFERENCES builds(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    estimated_price_centavos INTEGER CHECK (estimated_price_centavos IS NULL OR estimated_price_centavos >= 0),
    photos TEXT,
    product_link TEXT,
    notes TEXT,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high')),
    is_acquired INTEGER NOT NULL DEFAULT 0,
    acquired_expense_id TEXT REFERENCES expenses(id) ON DELETE SET NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX idx_plan_items_build ON build_plan_items (build_id)`,
];
