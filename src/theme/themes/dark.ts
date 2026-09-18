import { brand } from '../brand';
import type { ThemeDefinition } from '../types';
import {
  baseIconSize,
  baseMotion,
  baseRadius,
  baseSize,
  baseSpace,
  baseType,
} from './base';

/**
 * Dark theme (default) — layered near-black surfaces from the design board,
 * lime accent. Elevation is a surface step; the only shadows are the accent
 * glow and sheets.
 */
export const darkTheme: ThemeDefinition = {
  id: 'dark',
  base: 'dark',
  tokens: {
    bg: {
      page: brand.ink.page,
      surface: brand.ink.surface,
      surfaceVariant: brand.ink.variant,
      card: brand.ink.card,
      raised: brand.ink.raised,
      sheet: brand.ink.raised,
      nav: 'rgba(20,20,22,0.92)',
      input: brand.ink.card,
      inputFocused: brand.ink.raised,
    },
    glass: {
      fill: 'rgba(36,36,39,0.80)',
      // Near-opaque: without a real backdrop-blur, a subtle tint reads as
      // "basically the same as the page" in any lighting/compression — the
      // floating nav and sheets need a color that's unmistakably a raised
      // card, not just faintly different.
      fillStrong: 'rgba(40,40,44,0.97)',
      border: 'rgba(255,255,255,0.14)',
      highlight: 'rgba(255,255,255,0.16)',
    },
    text: {
      primary: '#F5F5F0',
      secondary: '#D8D8D4',
      tertiary: '#8A8A8E',
      placeholder: '#6C6C70',
      disabled: 'rgba(245,245,240,0.35)',
      onAccent: brand.accentInk,
      onAccentSoft: brand.accentInkSoft,
    },
    icon: {
      primary: '#D8D8D4',
      secondary: '#8A8A8E',
    },
    border: {
      divider: 'rgba(255,255,255,0.07)',
      strong: brand.ink.line,
      focus: brand.accent,
    },
    overlay: {
      scrim: 'rgba(0,0,0,0.62)',
      scrimSoft: 'rgba(0,0,0,0.45)',
    },
    primary: {
      base: brand.accent,
      pressed: brand.accentPressed,
      bg: brand.accentSoft.dark,
      on: brand.accentInk,
      text: brand.accentText.dark,
      glow: brand.accentGlow,
    },
    secondary: {
      base: '#9FB3C2',
      bg: '#1A2226',
    },
    accent: brand.accent,
    premium: {
      base: '#E3B341',
      bg: '#33290F',
      on: '#1A1400',
    },
    state: {
      disabledBg: 'rgba(255,255,255,0.08)',
      disabledText: 'rgba(245,245,240,0.4)',
      pressed: 'rgba(255,255,255,0.06)',
    },
    feedback: {
      success: { base: brand.success.dark, bg: 'rgba(95,211,107,0.16)' },
      warning: { base: brand.warning.dark, bg: 'rgba(255,176,32,0.16)' },
      error: { base: brand.error.dark, bg: 'rgba(255,92,92,0.16)' },
      info: { base: brand.info.dark, bg: 'rgba(111,183,255,0.16)' },
    },
    status: {
      excellent: { base: brand.accent, bg: brand.accentSoft.dark },
      good: { base: brand.success.dark, bg: 'rgba(95,211,107,0.16)' },
      dueSoon: { base: brand.warning.dark, bg: 'rgba(255,176,32,0.16)' },
      overdue: { base: brand.error.dark, bg: 'rgba(255,92,92,0.16)' },
      critical: { base: '#FF7A70', bg: 'rgba(255,122,112,0.18)' },
      neutral: { base: '#8A8A8E', bg: 'rgba(138,138,142,0.16)' },
    },
    health: {
      excellent: brand.accent,
      good: brand.success.dark,
      fair: brand.warning.dark,
      poor: brand.error.dark,
      critical: '#FF7A70',
    },
    notif: {
      reminder: brand.accent,
      warning: brand.warning.dark,
      success: brand.success.dark,
      info: brand.info.dark,
      error: brand.error.dark,
    },
    chart: {
      slot1: brand.accent,
      slot2: '#6FB7FF',
      slot3: '#FFB020',
      slot4: '#5FD36B',
      slot5: '#B48CFF',
      other: '#6C6C70',
      grid: '#2C2C2E',
    },
    type: baseType,
    space: baseSpace,
    radius: baseRadius,
    elevation: {
      card: null,
      sheet: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.45,
        shadowRadius: 24,
        elevation: 12,
      },
      accent: {
        shadowColor: brand.accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 18,
        elevation: 10,
      },
    },
    motion: baseMotion,
    iconSize: baseIconSize,
    size: baseSize,
  },
};
