import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';

import { useTheme } from '@/theme/useTheme';

type GlyphName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/**
 * Canonical concept → MCI glyph mapping (ICON_GUIDE.md §4) — extend, don't rename.
 * All icons go through this wrapper; raw set access elsewhere is a defect.
 */
const GLYPHS = {
  motorcycle: 'motorbike',
  engineOil: 'oil',
  airFilter: 'air-filter',
  sparkPlug: 'flash',
  coolant: 'coolant-temperature',
  brakes: 'car-brake-alert',
  tire: 'tire',
  battery: 'car-battery',
  cvt: 'cog-sync',
  chain: 'link-variant',
  maintenance: 'wrench',
  repair: 'hammer-wrench',
  fuel: 'gas-station',
  expense: 'cash',
  odometer: 'speedometer',
  documents: 'file-document-multiple',
  reminder: 'bell',
  health: 'heart-pulse',
  statistics: 'chart-bar',
  premium: 'crown',
  settings: 'cog',
  garage: 'garage',
  chevronRight: 'chevron-right',
  chevronDown: 'chevron-down',
  plus: 'plus',
  homeActive: 'home-variant',
  homeIdle: 'home-variant-outline',
  maintenanceIdle: 'wrench-outline',
  moneyActive: 'wallet',
  moneyIdle: 'wallet-outline',
  more: 'dots-horizontal',
  statusGood: 'check-circle',
  statusDueSoon: 'clock-alert-outline',
  statusOverdue: 'alert-circle',
  statusCritical: 'alert-octagon',
  statusNeutral: 'help-circle-outline',
  trendUp: 'trending-up',
  trendDown: 'trending-down',
  themeSystem: 'theme-light-dark',
  themeLight: 'white-balance-sunny',
  themeDark: 'weather-night',
  hourglass: 'timer-sand',
  close: 'close',
  help: 'help-circle-outline',
  replay: 'replay',
  lightbulb: 'lightbulb-on-outline',
  search: 'magnify',
} as const satisfies Record<string, GlyphName>;

export type IconName = keyof typeof GLYPHS;

export interface IconProps {
  name: IconName;
  /** Size token value from tokens.iconSize (ICON_GUIDE.md §2). */
  size?: number;
  /** Token color value; defaults to icon.primary. */
  color?: string;
  /** Meaningful icons carry a label; omitted = decorative (hidden from readers). */
  accessibilityLabel?: string;
}

export function Icon({ name, size, color, accessibilityLabel }: IconProps) {
  const { tokens } = useTheme();
  const isDecorative = accessibilityLabel === undefined;
  return (
    <MaterialCommunityIcons
      name={GLYPHS[name]}
      size={size ?? tokens.iconSize.md}
      color={color ?? tokens.icon.primary}
      accessibilityElementsHidden={isDecorative}
      importantForAccessibility={isDecorative ? 'no-hide-descendants' : 'yes'}
      {...(accessibilityLabel !== undefined ? { accessibilityLabel } : {})}
    />
  );
}
