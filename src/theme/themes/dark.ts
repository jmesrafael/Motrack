import type { ThemeDefinition } from '../types';
import { baseIconSize, baseMotion, baseRadius, baseSpace, baseType } from './base';

/**
 * Dark theme — layered near-black surfaces, not inverted light; elevation is a
 * surface step, never a shadow (DESIGN_SYSTEM.md §1.1/§5). Values per A-17.
 */
export const darkTheme: ThemeDefinition = {
  id: 'dark',
  base: 'dark',
  tokens: {
    bg: {
      page: '#0d0d0d',
      surface: '#1a1a19',
      surfaceVariant: '#232322',
      card: '#1e1e1d',
      raised: '#242423',
      sheet: '#242423',
      nav: '#161615',
      input: '#232322',
    },
    text: {
      primary: '#ffffff',
      secondary: '#c3c2b7',
      tertiary: '#8f8d86',
      placeholder: '#7c7a74',
      disabled: 'rgba(255,255,255,0.35)',
    },
    icon: {
      primary: '#c3c2b7',
      secondary: '#8f8d86',
    },
    border: {
      divider: 'rgba(255,255,255,0.10)',
      strong: '#383835',
    },
    overlay: {
      scrim: 'rgba(0,0,0,0.60)',
    },
    primary: {
      base: '#3987e5',
      pressed: '#2a78d6',
      bg: '#104281',
      on: '#ffffff',
    },
    secondary: {
      base: '#9fb3c2',
      bg: '#243039',
    },
    accent: '#e5863c',
    premium: {
      base: '#e3b341',
      bg: '#33290f',
      on: '#1a1400',
    },
    state: {
      disabledBg: 'rgba(255,255,255,0.08)',
    },
    feedback: {
      success: { base: '#35b940', bg: 'rgba(53,185,64,0.18)' },
      warning: { base: '#ffc247', bg: 'rgba(255,194,71,0.18)' },
      error: { base: '#e46262', bg: 'rgba(228,98,98,0.18)' },
      info: { base: '#3987e5', bg: 'rgba(57,135,229,0.18)' },
    },
    status: {
      excellent: { base: '#52d269', bg: 'rgba(82,210,105,0.18)' },
      good: { base: '#35b940', bg: 'rgba(53,185,64,0.18)' },
      dueSoon: { base: '#ffc247', bg: 'rgba(255,194,71,0.18)' },
      overdue: { base: '#e46262', bg: 'rgba(228,98,98,0.18)' },
      critical: { base: '#ff7a70', bg: 'rgba(255,122,112,0.18)' },
      neutral: { base: '#8f8d86', bg: 'rgba(143,141,134,0.18)' },
    },
    health: {
      excellent: '#52d269',
      good: '#35b940',
      fair: '#ffc247',
      poor: '#e46262',
      critical: '#ff7a70',
    },
    notif: {
      reminder: '#3987e5',
      warning: '#ffc247',
      success: '#35b940',
      info: '#45b8c8',
      error: '#e46262',
    },
    chart: {
      slot1: '#3987e5',
      slot2: '#199e70',
      slot3: '#c98500',
      slot4: '#008300',
      slot5: '#9085e9',
      other: '#8f8d86',
      grid: '#2c2c2a',
    },
    type: baseType,
    space: baseSpace,
    radius: baseRadius,
    elevation: {
      sheet: null,
    },
    motion: baseMotion,
    iconSize: baseIconSize,
  },
};
