import type { DashboardData } from '@/types/domain';

/**
 * Validation-phase fixture (TESTING.md §8 fixtures live here). Numbers are
 * internally consistent: category amounts sum to the month total; statuses
 * plausibly yield the shown Health Score under HEALTH_SCORE.md §5.
 */
export const dashboardFixture: DashboardData = {
  riderName: 'Rafael',
  bike: {
    id: 'bike-1',
    nickname: 'Daily NMAX',
    brand: 'Yamaha',
    model: 'NMAX 155',
    plate: 'AB 12345',
    odometerKm: 21480,
    odometerAsOf: '2026-07-04',
  },
  healthScore: 87,
  upcoming: [
    {
      id: 'sched-oil',
      icon: 'engineOil',
      label: 'Engine oil',
      status: 'dueSoon',
      remainingText: 'in 240 km',
    },
    {
      id: 'sched-cvt',
      icon: 'cvt',
      label: 'CVT cleaning',
      status: 'dueSoon',
      remainingText: 'in 18 days',
    },
    {
      id: 'sched-brakes',
      icon: 'brakes',
      label: 'Brake pads · front',
      status: 'good',
      remainingText: 'in 4,200 km',
    },
    {
      id: 'sched-tire',
      icon: 'tire',
      label: 'Tire · rear',
      status: 'good',
      remainingText: 'in 6,800 km',
    },
    {
      id: 'sched-battery',
      icon: 'battery',
      label: 'Battery',
      status: 'good',
      remainingText: 'in 9 months',
    },
  ],
  documentWarning: {
    id: 'doc-orcr',
    message: 'OR/CR expires in 12 days',
  },
  activity: [
    {
      id: 'act-1',
      kind: 'fuel',
      icon: 'fuel',
      title: 'Fuel · 4.2 L',
      dateIso: '2026-07-02',
      odometerKm: 21430,
      amountCentavos: 28000,
    },
    {
      id: 'act-2',
      kind: 'maintenance',
      icon: 'engineOil',
      title: 'Engine oil change',
      dateIso: '2026-06-21',
      odometerKm: 20400,
      amountCentavos: 45000,
    },
    {
      id: 'act-3',
      kind: 'repair',
      icon: 'repair',
      title: 'Brake lever adjustment',
      dateIso: '2026-06-14',
      amountCentavos: 15000,
    },
  ],
  month: {
    label: 'July',
    totalCentavos: 234000,
    deltaCaption: '₱260 less than June',
    categories: [
      { id: 'fuel', label: 'Fuel', amountCentavos: 112000, slot: 'slot1' },
      { id: 'service', label: 'Service', amountCentavos: 60000, slot: 'slot2' },
      { id: 'oil', label: 'Oil', amountCentavos: 45000, slot: 'slot3' },
      { id: 'other', label: 'Other', amountCentavos: 17000, slot: 'other' },
    ],
  },
};
