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
 * Light theme — warm off-white paper with the same lime accent for FILLS
 * (buttons, hero card) and a deeper lime-green for accent TEXT so contrast
 * holds. Cards get a soft shadow instead of a surface step.
 */
export const lightTheme: ThemeDefinition = {
  id: 'light',
  base: 'light',
  tokens: {
    bg: {
      page: brand.paper.page,
      surface: brand.paper.surface,
      surfaceVariant: brand.paper.variant,
      card: brand.paper.card,
      raised: brand.paper.raised,
      sheet: brand.paper.raised,
      nav: 'rgba(255,255,255,0.90)',
      input: brand.paper.card,
      inputFocused: brand.paper.card,
    },
    glass: {
      fill: 'rgba(255,255,255,0.72)',
      fillStrong: 'rgba(255,255,255,0.88)',
      border: 'rgba(13,13,13,0.08)',
      highlight: 'rgba(255,255,255,0.9)',
    },
    text: {
      primary: '#0D0D0D',
      secondary: '#46464A',
      tertiary: '#7A7A7E',
      placeholder: '#9A9A9E',
      disabled: 'rgba(13,13,13,0.35)',
      onAccent: brand.accentInk,
      onAccentSoft: brand.accentInkSoft,
    },
    icon: {
      primary: '#46464A',
      secondary: '#8A8A8E',
    },
    border: {
      divider: 'rgba(13,13,13,0.08)',
      strong: brand.paper.line,
      focus: brand.accentText.light,
    },
    overlay: {
      scrim: 'rgba(13,13,13,0.5)',
      scrimSoft: 'rgba(13,13,13,0.35)',
    },
    primary: {
      base: brand.accent,
      pressed: brand.accentPressed,
      bg: brand.accentSoft.light,
      on: brand.accentInk,
      text: brand.accentText.light,
      glow: brand.accentGlow,
    },
    secondary: {
      base: '#4B5C6B',
      bg: '#E4E9EE',
    },
    accent: brand.accent,
    premium: {
      base: '#8A6400',
      bg: '#F6ECD2',
      on: '#FFFFFF',
    },
    state: {
      disabledBg: 'rgba(13,13,13,0.08)',
      disabledText: 'rgba(13,13,13,0.4)',
      pressed: 'rgba(13,13,13,0.05)',
    },
    feedback: {
      success: { base: brand.success.light, bg: 'rgba(30,142,62,0.12)' },
      warning: { base: brand.warning.light, bg: 'rgba(168,106,0,0.12)' },
      error: { base: brand.error.light, bg: 'rgba(201,49,49,0.12)' },
      info: { base: brand.info.light, bg: 'rgba(29,99,198,0.12)' },
    },
    status: {
      excellent: { base: brand.accentText.light, bg: brand.accentSoft.light },
      good: { base: brand.success.light, bg: 'rgba(30,142,62,0.12)' },
      dueSoon: { base: brand.warning.light, bg: 'rgba(168,106,0,0.14)' },
      overdue: { base: brand.error.light, bg: 'rgba(201,49,49,0.12)' },
      critical: { base: '#8F1212', bg: 'rgba(143,18,18,0.12)' },
      neutral: { base: '#7A7A7E', bg: 'rgba(122,122,126,0.12)' },
    },
    health: {
      excellent: brand.accentText.light,
      good: brand.success.light,
      fair: brand.warning.light,
      poor: brand.error.light,
      critical: '#8F1212',
    },
    notif: {
      reminder: brand.accentText.light,
      warning: brand.warning.light,
      success: brand.success.light,
      info: brand.info.light,
      error: brand.error.light,
    },
    chart: {
      slot1: brand.accentText.light,
      slot2: '#1D63C6',
      slot3: '#D98F00',
      slot4: '#1E8E3E',
      slot5: '#6B4BD6',
      other: '#9A9A9E',
      grid: '#E1E1DB',
    },
    type: baseType,
    space: baseSpace,
    radius: baseRadius,
    elevation: {
      card: {
        shadowColor: '#0D0D0D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 2,
      },
      sheet: {
        shadowColor: '#0D0D0D',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.14,
        shadowRadius: 24,
        elevation: 10,
      },
      accent: {
        shadowColor: '#7AA800',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.28,
        shadowRadius: 16,
        elevation: 8,
      },
    },
    motion: baseMotion,
    iconSize: baseIconSize,
    size: baseSize,
  },
};
