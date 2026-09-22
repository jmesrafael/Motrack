/**
 * Tolits brand palette — THE single place to change the product's identity.
 *
 * Both themes (themes/dark.ts, themes/light.ts) derive their accent, hero and
 * status colors from here. Change `accent` and every button, ring, chip, FAB,
 * active tab and hero card follows. Nothing outside src/theme may reference
 * these values directly — components read tokens through useTheme().
 */

export const brand = {
  /** Signature accent — lime on near-black is the Tolits look. */
  accent: '#C8FF3D',
  accentPressed: '#B4EA2C',
  /** Ink used on top of the accent (buttons, hero card). */
  accentInk: '#0D0D0D',
  /** Darker ink for secondary copy on the accent surface. */
  accentInkSoft: '#233007',
  /**
   * Accent readable as TEXT/ICON per base. Lime fails contrast on light
   * surfaces, so light bases use a deeper lime-green for text and icons while
   * fills keep the true accent.
   */
  accentText: { dark: '#C8FF3D', light: '#4F7A00' },
  /** Tinted accent wash for chips, icon wells and selected rows. */
  accentSoft: { dark: 'rgba(200,255,61,0.14)', light: 'rgba(200,255,61,0.32)' },
  /** Glow used behind the FAB / hero card. */
  accentGlow: 'rgba(200,255,61,0.35)',

  /** Neutral ramp — near-black layered surfaces (never inverted light). */
  ink: {
    page: '#0A0A0A',
    surface: '#111113',
    card: '#17171A',
    raised: '#1C1C1E',
    variant: '#242426',
    line: '#2C2C2E',
  },
  paper: {
    page: '#F4F4F0',
    surface: '#FAFAF7',
    card: '#FFFFFF',
    raised: '#FFFFFF',
    variant: '#ECECE7',
    line: '#E1E1DB',
  },

  /** Feedback ramp (same hue family across bases; light darkens for contrast). */
  success: { dark: '#5FD36B', light: '#1E8E3E' },
  warning: { dark: '#FFB020', light: '#A86A00' },
  error: { dark: '#FF5C5C', light: '#C93131' },
  info: { dark: '#6FB7FF', light: '#1D63C6' },
} as const;
