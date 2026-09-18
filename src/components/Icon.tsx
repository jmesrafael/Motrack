import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';

import { useTheme } from '@/theme/useTheme';

type GlyphName = ComponentProps<typeof MaterialCommunityIcons>['name'];
type MaterialGlyphName = ComponentProps<typeof MaterialIcons>['name'];

/** Icon names rendered from the MaterialIcons set instead of the default MCI set below. */
const MATERIAL_GLYPHS = {
  motorcycle: 'motorcycle',
} as const satisfies Partial<Record<string, MaterialGlyphName>>;

/**
 * Canonical concept → MCI glyph mapping (ICON_GUIDE.md §4) — extend, don't rename.
 * All icons go through this wrapper; raw set access elsewhere is a defect.
 */
const GLYPHS = {
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
  chevronLeft: 'chevron-left',
  chevronDown: 'chevron-down',
  plus: 'plus',
  homeActive: 'home-variant',
  homeIdle: 'home-variant-outline',
  maintenanceIdle: 'wrench-outline',
  moneyActive: 'receipt-text',
  moneyIdle: 'receipt-text-outline',
  more: 'dots-horizontal',
  statusGood: 'check-circle',
  statusDueSoon: 'clock-alert-outline',
  statusOverdue: 'alert-circle',
  statusCritical: 'alert-octagon',
  statusNeutral: 'help-circle-outline',
  themeSystem: 'theme-light-dark',
  themeLight: 'white-balance-sunny',
  themeDark: 'moon-full',
  hourglass: 'timer-sand',
  close: 'close',
  help: 'help-circle-outline',
  replay: 'replay',
  lightbulb: 'lightbulb-on-outline',
  search: 'magnify',
  arrowRight: 'arrow-right',
  arrowLeft: 'arrow-left',
  check: 'check-bold',
  checkCircle: 'check-circle',
  history: 'history',
  calendarClock: 'calendar-clock',
  bikeSetup: 'clipboard-list-outline',
  shield: 'shield-check-outline',
  trendingUp: 'trending-up',
  sparkle: 'creation',
  bell: 'bell',
  bellOff: 'bell-off-outline',
  export: 'export-variant',
  camera: 'camera-outline',
  file: 'file-outline',
  image: 'image-outline',
  dot: 'circle-medium',
} as const satisfies Record<string, GlyphName>;

export type IconName = keyof typeof GLYPHS | keyof typeof MATERIAL_GLYPHS;

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
  const commonProps = {
    size: size ?? tokens.iconSize.md,
    color: color ?? tokens.icon.primary,
    accessibilityElementsHidden: isDecorative,
    importantForAccessibility: (isDecorative ? 'no-hide-descendants' : 'yes') as 'no-hide-descendants' | 'yes',
    ...(accessibilityLabel !== undefined ? { accessibilityLabel } : {}),
  };

  if (name in MATERIAL_GLYPHS) {
    return <MaterialIcons name={MATERIAL_GLYPHS[name as keyof typeof MATERIAL_GLYPHS]} {...commonProps} />;
  }
  return <MaterialCommunityIcons name={GLYPHS[name as keyof typeof GLYPHS]} {...commonProps} />;
}
