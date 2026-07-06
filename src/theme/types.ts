/**
 * ThemeTokens contract — every registered theme must satisfy it completely
 * (THEME_GUIDE.md §2). Token names/values are owned by DESIGN_SYSTEM.md.
 * All values stay serializable (plain values, no functions) for the
 * Phase-3 token JSON export (DESIGN_SYSTEM.md §7).
 */

export type ThemeBase = 'light' | 'dark';

export interface ColorPair {
  base: string;
  bg: string;
}

export interface SurfaceTokens {
  page: string;
  surface: string;
  surfaceVariant: string;
  card: string;
  raised: string;
  sheet: string;
  nav: string;
  input: string;
}

export interface TextColorTokens {
  primary: string;
  secondary: string;
  tertiary: string;
  placeholder: string;
  disabled: string;
}

export interface IconColorTokens {
  primary: string;
  secondary: string;
}

export interface BorderTokens {
  divider: string;
  strong: string;
}

export interface OverlayTokens {
  scrim: string;
}

export interface PrimaryTokens {
  base: string;
  pressed: string;
  bg: string;
  on: string;
}

export interface PremiumTokens {
  base: string;
  bg: string;
  on: string;
}

export interface StateTokens {
  disabledBg: string;
}

export interface FeedbackTokens {
  success: ColorPair;
  warning: ColorPair;
  error: ColorPair;
  info: ColorPair;
}

/** Motorcycle status ramp — reserved, never chart series (DESIGN_SYSTEM.md §2.1). */
export interface StatusTokens {
  excellent: ColorPair;
  good: ColorPair;
  dueSoon: ColorPair;
  overdue: ColorPair;
  critical: ColorPair;
  neutral: ColorPair;
}

/** Health Score band colors — five bands (HEALTH_SCORE.md §6). */
export interface HealthTokens {
  excellent: string;
  good: string;
  fair: string;
  poor: string;
  critical: string;
}

export interface NotifTokens {
  reminder: string;
  warning: string;
  success: string;
  info: string;
  error: string;
}

/** Categorical chart slots — entity-stable assignment (DESIGN_SYSTEM.md §3). */
export interface ChartTokens {
  slot1: string;
  slot2: string;
  slot3: string;
  slot4: string;
  slot5: string;
  other: string;
  grid: string;
}

export type TypeWeight = '400' | '600' | '700';

export interface TypeToken {
  fontSize: number;
  lineHeight: number;
  fontWeight: TypeWeight;
  letterSpacing?: number;
  uppercase?: boolean;
}

export interface TypeTokens {
  display: TypeToken;
  h1: TypeToken;
  h2: TypeToken;
  body: TypeToken;
  bodyStrong: TypeToken;
  caption: TypeToken;
  label: TypeToken;
}

/** 4-pt spacing scale (DESIGN_SYSTEM.md §5). Screen gutter = s4. */
export interface SpaceTokens {
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  s5: number;
  s6: number;
  s8: number;
  s10: number;
}

export interface RadiusTokens {
  sm: number;
  md: number;
  lg: number;
  full: number;
}

/** Serializable shadow fragment; dark bases use surface steps instead (DESIGN_SYSTEM.md §5). */
export interface ShadowToken {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface ElevationTokens {
  /** The only shadow in the system — sheets/raised action surfaces on light bases. */
  sheet: ShadowToken | null;
}

/** Motion token values are owned by ANIMATION_GUIDE.md §2; carried per theme. */
export interface MotionToken {
  durationMs: number;
}

export interface MotionTokens {
  fast: MotionToken;
  base: MotionToken;
  slow: MotionToken;
}

/** Icon sizes are owned by ICON_GUIDE.md §2; carried per theme. */
export interface IconSizeTokens {
  inline: number;
  listLeading: number;
  md: number;
  feature: number;
}

export interface ThemeTokens {
  bg: SurfaceTokens;
  text: TextColorTokens;
  icon: IconColorTokens;
  border: BorderTokens;
  overlay: OverlayTokens;
  primary: PrimaryTokens;
  secondary: ColorPair;
  accent: string;
  premium: PremiumTokens;
  state: StateTokens;
  feedback: FeedbackTokens;
  status: StatusTokens;
  health: HealthTokens;
  notif: NotifTokens;
  chart: ChartTokens;
  type: TypeTokens;
  space: SpaceTokens;
  radius: RadiusTokens;
  elevation: ElevationTokens;
  motion: MotionTokens;
  iconSize: IconSizeTokens;
}

export interface ThemeDefinition {
  id: string;
  /** Light-or-dark family — read only by the engine (StatusBar, system mapping). */
  base: ThemeBase;
  tokens: ThemeTokens;
}
