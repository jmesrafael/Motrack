import { strings } from '@/i18n/strings';
import type { TutorialConfig, TutorialStep } from '../types';

/**
 * Per-screen tours beyond the dashboard. Mostly passive steps; anchored where
 * the screen has a registered anchor, centered otherwise. Each is independent
 * and replayable from Help & Tutorials.
 */

const t = strings.tutorial;

function centered(
  id: string,
  route: string,
  copy: { title: string; body: string },
  icon?: TutorialStep['icon'],
): TutorialStep {
  return {
    id,
    route,
    title: copy.title,
    body: copy.body,
    ...(icon !== undefined ? { icon } : {}),
    advance: { type: 'next' },
  };
}

export const garageTour: TutorialConfig = {
  id: 'garage',
  kind: 'tour',
  version: 1,
  title: t.garage.title,
  entryRoute: '/garage',
  steps: [
    centered('intro', '/garage', t.garage.intro, 'garage'),
    {
      id: 'add-bike',
      route: '/garage',
      anchorId: 'garage.addBike',
      shape: { kind: 'pill' },
      title: t.garage.addBike.title,
      body: t.garage.addBike.body,
      icon: 'plus',
      advance: { type: 'next' },
    },
  ],
};

export const maintenanceTour: TutorialConfig = {
  id: 'maintenance',
  kind: 'tour',
  version: 1,
  title: t.maintenance.title,
  entryRoute: '/maintenance',
  steps: [
    centered('intro', '/maintenance', t.maintenance.intro, 'maintenance'),
    {
      id: 'schedule',
      route: '/maintenance',
      anchorId: 'maintenance.list',
      shape: { kind: 'rect' },
      title: t.maintenance.schedule.title,
      body: t.maintenance.schedule.body,
      advance: { type: 'next' },
    },
    {
      id: 'history',
      route: '/maintenance',
      title: t.maintenance.history.title,
      body: t.maintenance.history.body,
      advance: { type: 'next' },
      condition: (ctx) => ctx.hasMaintenanceHistory,
    },
    {
      id: 'log',
      route: '/maintenance',
      anchorId: 'tab.log',
      shape: { kind: 'circle', padding: 4 },
      title: t.maintenance.log.title,
      body: t.maintenance.log.body,
      placement: 'above',
      advance: { type: 'next' },
    },
  ],
};

export const fuelTour: TutorialConfig = {
  id: 'fuel',
  kind: 'tour',
  version: 1,
  title: t.fuel.title,
  entryRoute: '/fuel/log',
  condition: (ctx) => ctx.hasActiveBike,
  steps: [
    centered('intro', '/fuel/log', t.fuel.intro, 'fuel'),
    centered('form', '/fuel/log', t.fuel.form),
  ],
};

export const expensesTour: TutorialConfig = {
  id: 'expenses',
  kind: 'tour',
  version: 1,
  title: t.expenses.title,
  entryRoute: '/expense/log',
  condition: (ctx) => ctx.hasActiveBike,
  steps: [
    centered('intro', '/expense/log', t.expenses.intro, 'expense'),
    centered('form', '/expense/log', t.expenses.form),
  ],
};

export const repairsTour: TutorialConfig = {
  id: 'repairs',
  kind: 'tour',
  version: 1,
  title: t.repairs.title,
  entryRoute: '/repair/log',
  condition: (ctx) => ctx.hasActiveBike,
  steps: [centered('intro', '/repair/log', t.repairs.intro, 'repair')],
};

export const documentsTour: TutorialConfig = {
  id: 'documents',
  kind: 'tour',
  version: 1,
  title: t.documents.title,
  entryRoute: '/documents',
  steps: [centered('intro', '/documents', t.documents.intro, 'documents')],
};

export const statisticsTour: TutorialConfig = {
  id: 'statistics',
  kind: 'tour',
  version: 1,
  title: t.statistics.title,
  entryRoute: '/statistics',
  steps: [centered('intro', '/statistics', t.statistics.intro, 'statistics')],
};

export const searchTour: TutorialConfig = {
  id: 'search',
  kind: 'tour',
  version: 1,
  title: t.search.title,
  entryRoute: '/search',
  steps: [centered('intro', '/search', t.search.intro, 'search')],
};

export const settingsTour: TutorialConfig = {
  id: 'settings',
  kind: 'tour',
  version: 1,
  title: t.settings.title,
  entryRoute: '/settings',
  steps: [centered('intro', '/settings', t.settings.intro, 'settings')],
};
