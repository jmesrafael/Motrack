import { strings } from '@/i18n/strings';
import type { TutorialConfig } from '../types';

const t = strings.tutorial.dashboard;

/**
 * The main tour: dashboard highlights, one interactive cross-screen step into
 * the Maintenance tab. Requires an active bike (offered right after setup).
 */
export const dashboardTour: TutorialConfig = {
  id: 'dashboard',
  kind: 'tour',
  version: 1,
  title: t.title,
  entryRoute: '/',
  condition: (ctx) => ctx.hasActiveBike,
  steps: [
    {
      id: 'intro',
      route: '/',
      title: t.intro.title,
      body: t.intro.body,
      icon: 'homeActive',
      advance: { type: 'next' },
    },
    {
      id: 'bike-chip-multi',
      route: '/',
      anchorId: 'dashboard.bikeChip',
      shape: { kind: 'pill' },
      title: t.bikeChip.title,
      body: t.bikeChip.body,
      advance: { type: 'next' },
      condition: (ctx) => ctx.bikeCount > 1,
    },
    {
      id: 'bike-chip-single',
      route: '/',
      anchorId: 'dashboard.bikeChip',
      shape: { kind: 'pill' },
      title: t.bikeChipSingle.title,
      body: t.bikeChipSingle.body,
      advance: { type: 'next' },
      condition: (ctx) => ctx.bikeCount <= 1,
    },
    {
      id: 'health',
      route: '/',
      anchorId: 'dashboard.healthHero',
      shape: { kind: 'rect' },
      title: t.health.title,
      body: t.health.body,
      icon: 'health',
      advance: { type: 'next' },
    },
    {
      id: 'odometer',
      route: '/',
      anchorId: 'dashboard.odometerCard',
      shape: { kind: 'rect' },
      title: t.odometer.title,
      body: t.odometer.body,
      icon: 'odometer',
      advance: { type: 'next' },
    },
    {
      id: 'quick-actions',
      route: '/',
      anchorId: 'dashboard.quickActions',
      shape: { kind: 'rect' },
      title: t.quickActions.title,
      body: t.quickActions.body,
      advance: { type: 'next' },
    },
    {
      id: 'maintenance-tab',
      route: '/',
      anchorId: 'tab.maintenance',
      shape: { kind: 'circle' },
      title: t.maintenanceTab.title,
      body: t.maintenanceTab.body,
      icon: 'maintenance',
      placement: 'above',
      advance: { type: 'navigate', route: '/maintenance' },
    },
    {
      id: 'maintenance-list',
      route: '/maintenance',
      anchorId: 'maintenance.list',
      shape: { kind: 'rect' },
      title: t.maintenanceList.title,
      body: t.maintenanceList.body,
      advance: { type: 'next' },
    },
  ],
};
