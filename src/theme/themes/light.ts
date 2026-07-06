import type { ThemeDefinition } from '../types';
import { baseIconSize, baseMotion, baseRadius, baseSpace, baseType } from './base';

/** Light theme — values from DESIGN_SYSTEM.md §1–§5 (provisional pre-branding, A-17). */
export const lightTheme: ThemeDefinition = {
  id: 'light',
  base: 'light',
  tokens: {
    bg: {
      page: '#f9f9f7',
      surface: '#fcfcfb',
      surfaceVariant: '#f1f0ec',
      card: '#fcfcfb',
      raised: '#ffffff',
      sheet: '#ffffff',
      nav: '#fcfcfb',
      input: '#ffffff',
    },
    text: {
      primary: '#0b0b0b',
      secondary: '#52514e',
      tertiary: '#898781',
      placeholder: '#898781',
      disabled: 'rgba(11,11,11,0.35)',
    },
    icon: {
      primary: '#52514e',
      secondary: '#898781',
    },
    border: {
      divider: 'rgba(11,11,11,0.10)',
      strong: '#c3c2b7',
    },
    overlay: {
      scrim: 'rgba(11,11,11,0.45)',
    },
    primary: {
      base: '#256abf',
      pressed: '#1c5cab',
      bg: '#cde2fb',
      on: '#ffffff',
    },
    secondary: {
      base: '#4b5c6b',
      bg: '#e4e9ee',
    },
    accent: '#b4540a',
    premium: {
      base: '#8a6400',
      bg: '#f6ecd2',
      on: '#ffffff',
    },
    state: {
      disabledBg: 'rgba(11,11,11,0.08)',
    },
    feedback: {
      success: { base: '#0ca30c', bg: 'rgba(12,163,12,0.12)' },
      warning: { base: '#b97d00', bg: 'rgba(185,125,0,0.12)' },
      error: { base: '#d03b3b', bg: 'rgba(208,59,59,0.12)' },
      info: { base: '#256abf', bg: 'rgba(37,106,191,0.12)' },
    },
    status: {
      excellent: { base: '#0b7a2e', bg: 'rgba(11,122,46,0.12)' },
      good: { base: '#0ca30c', bg: 'rgba(12,163,12,0.12)' },
      dueSoon: { base: '#fab219', bg: 'rgba(250,178,25,0.16)' },
      overdue: { base: '#d03b3b', bg: 'rgba(208,59,59,0.12)' },
      critical: { base: '#8f1212', bg: 'rgba(143,18,18,0.12)' },
      neutral: { base: '#898781', bg: 'rgba(137,135,129,0.12)' },
    },
    health: {
      excellent: '#0b7a2e',
      good: '#0ca30c',
      fair: '#fab219',
      poor: '#d03b3b',
      critical: '#8f1212',
    },
    notif: {
      reminder: '#256abf',
      warning: '#b97d00',
      success: '#0ca30c',
      info: '#0f7f8c',
      error: '#d03b3b',
    },
    chart: {
      slot1: '#2a78d6',
      slot2: '#1baf7a',
      slot3: '#eda100',
      slot4: '#008300',
      slot5: '#4a3aa7',
      other: '#898781',
      grid: '#e1e0d9',
    },
    type: baseType,
    space: baseSpace,
    radius: baseRadius,
    elevation: {
      sheet: {
        shadowColor: '#0b0b0b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
    },
    motion: baseMotion,
    iconSize: baseIconSize,
  },
};
