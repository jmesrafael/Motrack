/**
 * Versioned seed config — default intervals (BUSINESS_RULES.md §3), per-drivetrain
 * applicability (§2), and Health-Score weights (HEALTH_SCORE.md §4). Applied via
 * `schema_seed_version`; user-edited schedule rows are never overwritten
 * (DATABASE_DESIGN.md §9). All values are assumptions A-04/A-05.
 */

import type { ComponentType, DrivetrainType, ServiceType } from '@/types/enums';

export const SEED_VERSION = 1;

export interface ComponentDefault {
  intervalKm: number | null;
  intervalMonths: number | null;
  /** ✔ = auto-created enabled; ○ = auto-created disabled; absent = not created. */
  applicability: Partial<Record<DrivetrainType, 'enabled' | 'disabled'>>;
  defaultServiceType: ServiceType;
  /** Health Score component weight (HEALTH_SCORE.md §4). */
  weight: 1 | 2 | 3;
}

export const COMPONENT_DEFAULTS: Record<Exclude<ComponentType, 'custom'>, ComponentDefault> = {
  engine_oil: {
    intervalKm: 1500,
    intervalMonths: 3,
    applicability: { cvt: 'enabled', chain: 'enabled', other: 'enabled' },
    defaultServiceType: 'replace',
    weight: 3,
  },
  gear_oil: {
    intervalKm: 4500,
    intervalMonths: 6,
    applicability: { cvt: 'enabled', other: 'disabled' },
    defaultServiceType: 'replace',
    weight: 2,
  },
  oil_filter: {
    intervalKm: 8000,
    intervalMonths: 12,
    applicability: { cvt: 'disabled', chain: 'enabled', other: 'enabled' },
    defaultServiceType: 'replace',
    weight: 2,
  },
  air_filter_clean: {
    intervalKm: 4000,
    intervalMonths: 6,
    applicability: { cvt: 'enabled', chain: 'enabled', other: 'enabled' },
    defaultServiceType: 'clean',
    weight: 1,
  },
  air_filter_replace: {
    intervalKm: 12000,
    intervalMonths: 12,
    applicability: { cvt: 'enabled', chain: 'enabled', other: 'enabled' },
    defaultServiceType: 'replace',
    weight: 1,
  },
  spark_plug: {
    intervalKm: 8000,
    intervalMonths: 12,
    applicability: { cvt: 'enabled', chain: 'enabled', other: 'enabled' },
    defaultServiceType: 'replace',
    weight: 1,
  },
  coolant: {
    intervalKm: 20000,
    intervalMonths: 24,
    applicability: { cvt: 'disabled', chain: 'disabled', other: 'disabled' },
    defaultServiceType: 'replace',
    weight: 2,
  },
  brake_fluid: {
    intervalKm: 20000,
    intervalMonths: 24,
    applicability: { cvt: 'enabled', chain: 'enabled', other: 'enabled' },
    defaultServiceType: 'replace',
    weight: 3,
  },
  brake_pads_front: {
    intervalKm: 12000,
    intervalMonths: 24,
    applicability: { cvt: 'enabled', chain: 'enabled', other: 'enabled' },
    defaultServiceType: 'replace',
    weight: 3,
  },
  brake_pads_rear: {
    intervalKm: 12000,
    intervalMonths: 24,
    applicability: { cvt: 'enabled', chain: 'enabled', other: 'enabled' },
    defaultServiceType: 'replace',
    weight: 3,
  },
  tire_front: {
    intervalKm: 25000,
    intervalMonths: 60,
    applicability: { cvt: 'enabled', chain: 'enabled', other: 'enabled' },
    defaultServiceType: 'replace',
    weight: 3,
  },
  tire_rear: {
    intervalKm: 15000,
    intervalMonths: 60,
    applicability: { cvt: 'enabled', chain: 'enabled', other: 'enabled' },
    defaultServiceType: 'replace',
    weight: 3,
  },
  battery: {
    intervalKm: null,
    intervalMonths: 24,
    applicability: { cvt: 'enabled', chain: 'enabled', other: 'enabled' },
    defaultServiceType: 'replace',
    weight: 1,
  },
  cvt_cleaning: {
    intervalKm: 4000,
    intervalMonths: 6,
    applicability: { cvt: 'enabled' },
    defaultServiceType: 'clean',
    weight: 1,
  },
  cvt_belt: {
    intervalKm: 24000,
    intervalMonths: 24,
    applicability: { cvt: 'enabled' },
    defaultServiceType: 'replace',
    weight: 2,
  },
  cvt_rollers: {
    intervalKm: 12000,
    intervalMonths: 18,
    applicability: { cvt: 'enabled' },
    defaultServiceType: 'replace',
    weight: 2,
  },
  cvt_slider: {
    intervalKm: 12000,
    intervalMonths: 18,
    applicability: { cvt: 'enabled' },
    defaultServiceType: 'replace',
    weight: 2,
  },
  clutch_cleaning: {
    intervalKm: 8000,
    intervalMonths: 12,
    applicability: { cvt: 'enabled' },
    defaultServiceType: 'clean',
    weight: 1,
  },
  chain_lube: {
    intervalKm: 700,
    intervalMonths: 1,
    applicability: { chain: 'enabled' },
    defaultServiceType: 'clean',
    weight: 2,
  },
  chain_replacement: {
    intervalKm: 25000,
    intervalMonths: 36,
    applicability: { chain: 'enabled' },
    defaultServiceType: 'replace',
    weight: 2,
  },
  sprockets: {
    intervalKm: 25000,
    intervalMonths: 36,
    applicability: { chain: 'enabled' },
    defaultServiceType: 'replace',
    weight: 2,
  },
};

export const CUSTOM_COMPONENT_WEIGHT = 1;

/** Health Score weight for a component (custom components weigh 1 — HEALTH_SCORE.md §4). */
export function componentWeight(componentType: ComponentType): number {
  if (componentType === 'custom') {
    return CUSTOM_COMPONENT_WEIGHT;
  }
  return COMPONENT_DEFAULTS[componentType].weight;
}

/** Default service type for a component ('replace' fallback covers custom). */
export function componentDefaultServiceType(componentType: ComponentType): ServiceType {
  if (componentType === 'custom') {
    return 'replace';
  }
  return COMPONENT_DEFAULTS[componentType].defaultServiceType;
}
