/**
 * ThemeTokens contract — every registered theme must satisfy it completely
 * (THEME_GUIDE.md §2). Brand values come from brand.ts; themes only decide how
 * the brand maps onto a light or dark base. All values stay serializable.
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
  /** Focused input fill. */
  inputFocused: string;
}

export interface GlassTokens {
  /** Translucent fill layered over content (nav, sheets, floating cards). */
  fill: string;
  /** Slightly denser variant for cards that sit on busy content. */
  fillStrong: string;
  border: string;
  /** Top-edge highlight that sells the material without a blur pass. */
  highlight: string;
}

export interface TextColorTokens {
  primary: string;
  secondary: string;
  tertiary: string;
  placeholder: string;
  disabled: string;
  /** Text/icon on top of primary.base (buttons, hero). */
  onAccent: string;
  onAccentSoft: string;
}

export interface IconColorTokens {
  primary: string;
  secondary: string;
}

export interface BorderTokens {
  divider: string;
  strong: string;
  /** Accent outline for focused inputs and selected controls. */
  focus: string;
}

export interface OverlayTokens {
  scrim: string;
  /** Softer scrim for bottom sheets so context stays visible. */
  scrimSoft: string;
}

export interface PrimaryTokens {
  /** Fill color (buttons, FAB, hero card). */
  base: string;
  pressed: string;
  /** Tint wash (icon wells, selected rows). */
  bg: string;
  /** Ink on top of base. */
  on: string;
  /** Accent usable as text/icon on regular surfaces (contrast-safe per base). */
  text: string;
  /** Glow color for elevated accent surfaces. */
  glow: string;
}

export interface PremiumTokens {
  base: string;
  bg: string;
  on: string;
}

export interface StateTokens {
  disabledBg: string;
  disabledText: string;
  /** Press wash for list rows / cards. */
  pressed: string;
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

export type TypeWeight = '400' | '500' | '600' | '700' | '800';

export interface TypeToken {
  fontSize: number;
  lineHeight: number;
  fontWeight: TypeWeight;
  letterSpacing?: number;
  uppercase?: boolean;
}

export interface FontFamilyTokens {
  regular: string;
  medium: string;
  semibold: string;
  bold: string;
  extrabold: string;
}

export interface TypeTokens {
  /** Registered font family per weight; null = platform system font. */
  family: FontFamilyTokens | null;
  /** Big statement headline (dashboard hero, onboarding). */
  hero: TypeToken;
  /** Oversized numerals (health score, odometer). */
  stat: TypeToken;
  display: TypeToken;
  h1: TypeToken;
  h2: TypeToken;
  h3: TypeToken;
  body: TypeToken;
  bodyStrong: TypeToken;
  caption: TypeToken;
  captionStrong: TypeToken;
  /** Uppercase eyebrow label ("HEALTH SCORE"). */
  label: TypeToken;
}

/** 4-pt spacing scale (DESIGN_SYSTEM.md §5). Screen gutter = s5. */
export interface SpaceTokens {
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  s5: number;
  s6: number;
  s8: number;
  s10: number;
  s12: number;
  /** Horizontal screen gutter. */
  gutter: number;
}

export interface RadiusTokens {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

/** Serializable shadow fragment. */
export interface ShadowToken {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface ElevationTokens {
  /** Cards on light bases; null on dark (surface steps instead). */
  card: ShadowToken | null;
  /** Sheets, dialogs, toasts. */
  sheet: ShadowToken | null;
  /** Accent glow under the FAB / hero. */
  accent: ShadowToken;
}

export interface MotionToken {
  durationMs: number;
}

export interface MotionTokens {
  /** Press feedback, toggles. */
  fast: MotionToken;
  /** Most transitions. */
  base: MotionToken;
  /** Rings, celebrations, page enters. */
  slow: MotionToken;
  /** Scale applied on press by PressableScale. */
  pressScale: number;
  /** Spring config shared by pop-ins. */
  spring: { damping: number; stiffness: number; mass: number };
}

export interface IconSizeTokens {
  inline: number;
  listLeading: number;
  md: number;
  feature: number;
  hero: number;
}

export interface ComponentSizeTokens {
  buttonLg: number;
  buttonMd: number;
  input: number;
  row: number;
  fab: number;
  navHeight: number;
  iconWell: number;
  iconWellSm: number;
}

export interface ThemeTokens {
  bg: SurfaceTokens;
  glass: GlassTokens;
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
  size: ComponentSizeTokens;
}

export interface ThemeDefinition {
  id: string;
  /** Light-or-dark family — read only by the engine (StatusBar, system mapping). */
  base: ThemeBase;
  tokens: ThemeTokens;
}
