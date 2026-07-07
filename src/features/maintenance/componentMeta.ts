import type { IconName } from '@/components/Icon';
import { strings } from '@/i18n/strings';
import type { ComponentType } from '@/types/enums';

/** Canonical component → icon glyph (reuses ICON_GUIDE.md wrapper concepts). */
const COMPONENT_ICONS: Record<ComponentType, IconName> = {
  engine_oil: 'engineOil',
  gear_oil: 'engineOil',
  oil_filter: 'engineOil',
  air_filter_clean: 'airFilter',
  air_filter_replace: 'airFilter',
  spark_plug: 'sparkPlug',
  coolant: 'coolant',
  brake_fluid: 'brakes',
  brake_pads_front: 'brakes',
  brake_pads_rear: 'brakes',
  tire_front: 'tire',
  tire_rear: 'tire',
  battery: 'battery',
  cvt_cleaning: 'cvt',
  cvt_belt: 'cvt',
  cvt_rollers: 'cvt',
  cvt_slider: 'cvt',
  clutch_cleaning: 'cvt',
  chain_lube: 'chain',
  chain_replacement: 'chain',
  sprockets: 'chain',
  custom: 'maintenance',
};

export function componentIcon(componentType: ComponentType): IconName {
  return COMPONENT_ICONS[componentType];
}

export function componentLabel(componentType: ComponentType, customName: string | null): string {
  if (componentType === 'custom') {
    return customName ?? strings.components.custom;
  }
  return strings.components[componentType];
}
