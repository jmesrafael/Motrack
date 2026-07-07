/**
 * Migration 0001 — the complete MVP schema (DATABASE_DESIGN.md §5–§6).
 * Bundled as SQL-in-TS and applied by the MigrationRunner inside one
 * transaction (ADR-022; bundling approach recorded in ADR-029).
 */

export const migration0001: readonly string[] = [
  `CREATE TABLE motorcycles (
    id TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER,
    nickname TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER CHECK (year IS NULL OR (year >= 1980 AND year <= 2100)),
    drivetrain_type TEXT NOT NULL CHECK (drivetrain_type IN ('cvt','chain','other')),
    photo_path TEXT,
    plate_number TEXT,
    vin TEXT,
    engine_number TEXT,
    purchase_date TEXT,
    purchase_price_centavos INTEGER,
    current_odometer_km INTEGER NOT NULL DEFAULT 0,
    odometer_offset_km INTEGER NOT NULL DEFAULT 0,
    is_archived INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE UNIQUE INDEX idx_motorcycles_nickname_unique
     ON motorcycles (nickname COLLATE NOCASE) WHERE deleted_at IS NULL`,

  `CREATE TABLE maintenance_schedules (
    id TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER,
    motorcycle_id TEXT NOT NULL REFERENCES motorcycles(id) ON DELETE RESTRICT,
    component_type TEXT NOT NULL CHECK (component_type IN (
      'engine_oil','gear_oil','oil_filter','air_filter_clean','air_filter_replace',
      'spark_plug','coolant','brake_fluid','brake_pads_front','brake_pads_rear',
      'tire_front','tire_rear','battery','cvt_cleaning','cvt_belt','cvt_rollers',
      'cvt_slider','clutch_cleaning','chain_lube','chain_replacement','sprockets','custom')),
    custom_name TEXT,
    interval_km INTEGER CHECK (interval_km IS NULL OR (interval_km >= 100 AND interval_km <= 100000)),
    interval_months INTEGER CHECK (interval_months IS NULL OR (interval_months >= 1 AND interval_months <= 120)),
    is_enabled INTEGER NOT NULL DEFAULT 1,
    is_muted INTEGER NOT NULL DEFAULT 0,
    snoozed_until TEXT,
    anchor_odometer_km INTEGER,
    anchor_date TEXT,
    anchor_source TEXT CHECK (anchor_source IS NULL OR anchor_source IN ('record','baseline')),
    CHECK (interval_km IS NOT NULL OR interval_months IS NOT NULL)
  )`,
  `CREATE INDEX idx_schedules_bike ON maintenance_schedules (motorcycle_id)`,
  `CREATE UNIQUE INDEX idx_schedules_bike_component_unique
     ON maintenance_schedules (motorcycle_id, component_type)
     WHERE component_type != 'custom' AND deleted_at IS NULL`,

  `CREATE TABLE maintenance_records (
    id TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER,
    motorcycle_id TEXT NOT NULL REFERENCES motorcycles(id) ON DELETE RESTRICT,
    schedule_id TEXT NOT NULL REFERENCES maintenance_schedules(id) ON DELETE RESTRICT,
    performed_date TEXT NOT NULL,
    odometer_km INTEGER,
    service_type TEXT NOT NULL CHECK (service_type IN ('replace','clean','adjust')),
    cost_centavos INTEGER CHECK (cost_centavos IS NULL OR cost_centavos >= 0),
    brand TEXT,
    quantity TEXT,
    details TEXT,
    notes TEXT,
    photo_path TEXT,
    source TEXT NOT NULL DEFAULT 'user' CHECK (source IN ('user','import','workshop'))
  )`,
  `CREATE INDEX idx_records_bike_date ON maintenance_records (motorcycle_id, performed_date DESC)`,
  `CREATE INDEX idx_records_schedule_date ON maintenance_records (schedule_id, performed_date DESC)`,

  `CREATE TABLE repairs (
    id TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER,
    motorcycle_id TEXT NOT NULL REFERENCES motorcycles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    repair_date TEXT NOT NULL,
    odometer_km INTEGER,
    problem TEXT,
    diagnosis TEXT,
    solution TEXT,
    shop_name TEXT,
    cost_centavos INTEGER CHECK (cost_centavos IS NULL OR cost_centavos >= 0),
    photo_paths TEXT,
    notes TEXT
  )`,
  `CREATE INDEX idx_repairs_bike_date ON repairs (motorcycle_id, repair_date DESC)`,

  `CREATE TABLE expenses (
    id TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER,
    motorcycle_id TEXT NOT NULL REFERENCES motorcycles(id) ON DELETE RESTRICT,
    category TEXT NOT NULL CHECK (category IN (
      'fuel','oil','tires','service','repair','registration','insurance',
      'parking','accessories','washing','other')),
    amount_centavos INTEGER NOT NULL CHECK (amount_centavos >= 0),
    expense_date TEXT NOT NULL,
    notes TEXT,
    photo_path TEXT
  )`,
  `CREATE INDEX idx_expenses_bike_date ON expenses (motorcycle_id, expense_date DESC)`,

  `CREATE TABLE fuel_logs (
    id TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER,
    motorcycle_id TEXT NOT NULL REFERENCES motorcycles(id) ON DELETE RESTRICT,
    fuel_date TEXT NOT NULL,
    liters REAL NOT NULL CHECK (liters >= 0.1 AND liters <= 99.99),
    total_cost_centavos INTEGER NOT NULL CHECK (total_cost_centavos >= 0),
    odometer_km INTEGER NOT NULL,
    station TEXT,
    is_full_tank INTEGER NOT NULL DEFAULT 1,
    notes TEXT
  )`,
  `CREATE INDEX idx_fuel_bike_date ON fuel_logs (motorcycle_id, fuel_date DESC)`,

  `CREATE TABLE odometer_logs (
    id TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER,
    motorcycle_id TEXT NOT NULL REFERENCES motorcycles(id) ON DELETE RESTRICT,
    reading_km INTEGER NOT NULL CHECK (reading_km >= 0 AND reading_km <= 999999),
    effective_km INTEGER NOT NULL,
    recorded_date TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('initial','manual','fuel','maintenance','repair')),
    source_id TEXT
  )`,
  `CREATE INDEX idx_odo_bike_date ON odometer_logs (motorcycle_id, recorded_date DESC)`,

  `CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER,
    motorcycle_id TEXT REFERENCES motorcycles(id) ON DELETE RESTRICT,
    doc_type TEXT NOT NULL CHECK (doc_type IN (
      'orcr','insurance','license','warranty','receipt','invoice','other')),
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    expiry_date TEXT,
    notes TEXT
  )`,
  `CREATE INDEX idx_docs_bike ON documents (motorcycle_id)`,
  `CREATE INDEX idx_docs_expiry ON documents (expiry_date) WHERE expiry_date IS NOT NULL`,

  `CREATE TABLE scheduled_notifications (
    id TEXT PRIMARY KEY,
    notification_id TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('schedule','document','system')),
    source_id TEXT,
    fire_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX idx_sched_notif_fire ON scheduled_notifications (fire_at)`,

  `CREATE TABLE app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
];
