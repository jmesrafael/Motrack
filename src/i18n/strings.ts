/**
 * Validation-phase string source. The real implementation is i18next with
 * en/fil JSON resources (ADR-012, LOCALIZATION.md); keys below already follow
 * the final dot.camel namespace shape so migration is mechanical (T-005).
 */
export const strings = {
  tabs: {
    home: 'Home',
    maintenance: 'Maintenance',
    log: 'Log',
    money: 'Money',
    more: 'More',
  },
  dashboard: {
    greeting: {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
    },
    bikeChipA11y: 'Active motorcycle. Opens the bike switcher.',
    remindersA11y: 'Reminders',
    health: {
      scoreOf: '/ 100',
      caption: 'Tap for the full breakdown',
      a11y: 'Health score {score}, {band}. Opens the score breakdown.',
    },
    band: {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Needs attention',
      poor: 'Poor',
      critical: 'Critical',
    },
    odometer: {
      title: 'Odometer',
      asOf: 'as of {date}',
      update: 'Update',
    },
    nextMaintenance: {
      title: 'Next maintenance',
      seeAll: 'See all',
      due: {
        good: 'OK',
        dueSoon: 'Due soon',
        overdue: 'Overdue',
        neutral: 'Not set up',
      },
    },
    quickActions: {
      title: 'Quick actions',
      logService: 'Log service',
      addFuel: 'Add fuel',
      addExpense: 'Add expense',
      updateOdo: 'Update odo',
    },
    activity: {
      title: 'Recent activity',
    },
    month: {
      title: 'This month',
      totalLabel: 'Total spent',
    },
  },
  themeSwitcher: {
    a11y: 'Theme: {mode}. Switches to the next theme.',
    system: 'System',
    light: 'Light',
    dark: 'Dark',
  },
  pending: {
    title: 'Coming up next',
    body: 'This screen ships after the dashboard design is approved.',
  },
} as const;

/** Tiny interpolation helper until i18next lands (matches its {token} syntax). */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key];
    return value === undefined ? match : String(value);
  });
}
