/**
 * Canonical domain enums — exact string values used in DB CHECKs, code, and
 * i18n keys (BUSINESS_RULES.md §2, §9.1; DATABASE_DESIGN.md §5).
 */

export const DRIVETRAIN_TYPES = ['cvt', 'chain', 'other'] as const;
export type DrivetrainType = (typeof DRIVETRAIN_TYPES)[number];

export const COMPONENT_TYPES = [
  'engine_oil',
  'gear_oil',
  'oil_filter',
  'air_filter_clean',
  'air_filter_replace',
  'spark_plug',
  'coolant',
  'brake_fluid',
  'brake_pads_front',
  'brake_pads_rear',
  'tire_front',
  'tire_rear',
  'battery',
  'cvt_cleaning',
  'cvt_belt',
  'cvt_rollers',
  'cvt_slider',
  'clutch_cleaning',
  'chain_lube',
  'chain_replacement',
  'sprockets',
  'custom',
] as const;
export type ComponentType = (typeof COMPONENT_TYPES)[number];

export const SERVICE_TYPES = ['replace', 'clean', 'adjust'] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const EXPENSE_CATEGORIES = [
  'fuel',
  'oil',
  'tires',
  'service',
  'repair',
  'registration',
  'insurance',
  'parking',
  'accessories',
  'washing',
  'other',
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const DOC_TYPES = [
  'orcr',
  'insurance',
  'license',
  'warranty',
  'receipt',
  'invoice',
  'other',
] as const;
export type DocType = (typeof DOC_TYPES)[number];

/** Document types whose expiry drives reminders/badges (BUSINESS_RULES.md §8.1). */
export const EXPIRY_DOC_TYPES: readonly DocType[] = ['orcr', 'insurance', 'license'];

export const ODOMETER_SOURCES = ['initial', 'manual', 'fuel', 'maintenance', 'repair'] as const;
export type OdometerSource = (typeof ODOMETER_SOURCES)[number];

export const RECORD_SOURCES = ['user', 'import', 'workshop'] as const;
export type RecordSource = (typeof RECORD_SOURCES)[number];

export const ANCHOR_SOURCES = ['record', 'baseline'] as const;
export type AnchorSource = (typeof ANCHOR_SOURCES)[number];
