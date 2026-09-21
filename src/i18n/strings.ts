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
    money: 'Expense',
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
  components: {
    engine_oil: 'Engine oil',
    gear_oil: 'Gear oil',
    oil_filter: 'Oil filter',
    air_filter_clean: 'Air filter cleaning',
    air_filter_replace: 'Air filter replacement',
    spark_plug: 'Spark plug',
    coolant: 'Coolant',
    brake_fluid: 'Brake fluid',
    brake_pads_front: 'Front brake pads',
    brake_pads_rear: 'Rear brake pads/shoes',
    tire_front: 'Front tire',
    tire_rear: 'Rear tire',
    battery: 'Battery',
    cvt_cleaning: 'CVT cleaning',
    cvt_belt: 'CVT belt',
    cvt_rollers: 'CVT rollers',
    cvt_slider: 'CVT sliders',
    clutch_cleaning: 'Clutch cleaning',
    chain_lube: 'Chain clean & lube',
    chain_replacement: 'Chain replacement',
    sprockets: 'Sprockets',
    custom: 'Custom',
  },
  categories: {
    fuel: 'Fuel',
    oil: 'Oil',
    tires: 'Tires',
    service: 'Service',
    repair: 'Repair',
    registration: 'Registration',
    insurance: 'Insurance',
    parking: 'Parking',
    accessories: 'Accessories',
    washing: 'Washing',
    other: 'Other',
  },
  docTypes: {
    orcr: 'OR/CR',
    insurance: 'Insurance',
    license: "Driver's license",
    warranty: 'Warranty',
    receipt: 'Receipt',
    invoice: 'Invoice',
    other: 'Other',
  },
  sources: {
    odometer: {
      initial: 'Starting reading',
      manual: 'Manual entry',
      fuel: 'Fuel log',
      maintenance: 'Maintenance log',
      repair: 'Repair log',
    },
  },
  onboarding: {
    welcome: {
      title: 'Welcome to Motrack',
      body: 'Your motorcycle logbook for maintenance, fuel, and expenses, all offline on your phone.',
      bulletMaintenance: 'Never miss an oil change with schedules and a live Health Score.',
      bulletMoney: 'Track fuel and every peso your bike costs.',
      bulletDocuments: 'Keep OR/CR, insurance, and receipts one tap away.',
      getStarted: 'Get started',
      skipSetup: 'Skip setup',
    },
    carousel: {
      brand: 'Motrack',
      skip: 'Skip',
      next: 'Next',
      getStarted: 'Get started',
      stages: [
        {
          eyebrow: '01',
          title: 'Know your bike',
          body: 'Keep your bike’s details in one place: model, plate, VIN, and the odometer that everything else runs on.',
        },
        {
          eyebrow: '02',
          title: 'Never miss maintenance',
          body: 'Track services, schedules, and mileage, plus a live Health Score so you always know how your bike is doing.',
        },
        {
          eyebrow: '03',
          title: 'Keep your history',
          body: 'Build a real maintenance history over time. Every service, every peso spent, all in one searchable timeline.',
        },
      ] as { eyebrow: string; title: string; body: string }[],
    },
    language: {
      title: 'Choose your language',
      body: 'Pick the language you want Motrack to use. You can change this anytime in Settings.',
      english: 'English',
      englishHint: 'Use English throughout the app',
      tagalog: 'Tagalog',
      tagalogHint: 'Use Tagalog throughout the app',
      continue: 'Continue',
    },
    setup: {
      title: 'Set up your bike',
      stepOf: 'Step {current} of {total}',
      skipStep: 'Skip this step',
      back: 'Back',
      next: 'Next',
      finish: 'Finish',
      closeA11y: 'Exit setup',
      exitTitle: 'Exit setup?',
      exitBody: 'You can add your motorcycle and history later from the Garage.',
      exitConfirm: 'Exit setup',
      bike: {
        title: 'Add your motorcycle',
        body: 'Tell us the basics: model, plate, and current odometer.',
        why: 'This is what your dashboard and reminders are built around.',
      },
      oil: {
        title: 'Last oil change',
        body: 'When did you last change the engine oil? Skip this if you are not sure.',
        why: 'We will use this to start your maintenance schedule.',
        dateLabel: 'Date of last oil change',
        odoLabel: 'Odometer at that time (km, optional)',
        save: 'Save oil change',
        saved: 'Oil change recorded.',
      },
      done: {
        title: 'You are all set',
        body: 'Your garage is ready. Next stop, the dashboard.',
        cta: 'Go to dashboard',
      },
    },
  },
  tutorial: {
    common: {
      next: 'Next',
      back: 'Back',
      done: 'Done',
      skip: 'Skip tour',
      closeA11y: 'Close tutorial',
      stepOf: 'Step {current} of {total}',
      tryIt: 'Try it now: tap the highlighted control.',
      tryItLong: 'Try it now: press and hold the highlighted control.',
      tryItNavigate: 'Try it now. The tour continues on the next screen.',
      tryItSave: 'Try it now. The tour continues after you save.',
    },
    offer: {
      title: 'Would you like a quick tour?',
      body: 'Two minutes, skippable anytime. You can also replay it later from Settings.',
      start: 'Start tour',
      later: 'Not now',
      never: 'Never show this again',
    },
    resume: {
      title: 'Continue the tour?',
      body: 'You left a tour partway through.',
      resume: 'Resume',
      restart: 'Restart',
      dismiss: 'Not now',
    },
    dashboard: {
      title: 'Dashboard tour',
      intro: {
        title: 'This is your dashboard',
        body: 'Everything about your bike at a glance. A few highlights, skip anytime.',
      },
      bikeChip: {
        title: 'Your active bike',
        body: 'Tap here to open the Garage and switch between motorcycles.',
      },
      bikeChipSingle: {
        title: 'Your bike',
        body: 'Tap here to open the Garage. Add more bikes and switch between them anytime.',
      },
      health: {
        title: 'Health Score',
        body: 'A live 0–100 score from your maintenance schedule. Tap it anytime for the full breakdown.',
      },
      odometer: {
        title: 'Odometer',
        body: 'Keep this current. Schedules, reminders, and fuel stats all build on it.',
      },
      quickActions: {
        title: 'Quick actions',
        body: 'Log a service, fuel-up, expense, or odometer reading in a couple of taps.',
      },
      maintenanceTab: {
        title: 'Maintenance lives here',
        body: 'Tap the Maintenance tab to see every component schedule.',
      },
      maintenanceList: {
        title: 'Your schedule',
        body: 'Each component shows its status (OK, due soon, or overdue) from your odometer and history.',
      },
    },
    garage: {
      title: 'Garage tour',
      intro: {
        title: 'The Garage',
        body: 'All your motorcycles live here. The active bike drives the dashboard and logs.',
      },
      addBike: {
        title: 'Add motorcycles',
        body: 'Track as many bikes as you like. Each keeps its own schedule and history.',
      },
    },
    maintenance: {
      title: 'Maintenance tour',
      intro: {
        title: 'Maintenance',
        body: 'Component schedules, service logging, and your Health Score breakdown.',
      },
      schedule: {
        title: 'Component schedules',
        body: 'Every part is tracked by kilometers and months. Tap one for details and history.',
      },
      history: {
        title: 'Service history',
        body: 'Every logged service is kept per component, with costs and notes.',
      },
      log: {
        title: 'Log a service',
        body: 'Done an oil change? Log it and the schedule, Health Score, and stats update instantly.',
      },
    },
    fuel: {
      title: 'Fuel tour',
      intro: {
        title: 'Fuel logging',
        body: 'Record fuel-ups to get cost per kilometer and consumption trends.',
      },
      form: {
        title: 'Quick entry',
        body: 'Liters, cost, odometer. Full tank toggles give you accurate km/L.',
      },
    },
    expenses: {
      title: 'Expenses tour',
      intro: {
        title: 'Expenses',
        body: 'Every peso beyond fuel and services: registration, gear, parking, washes.',
      },
      form: {
        title: 'Categorized spending',
        body: 'Pick a category and amount; monthly stats roll it all up on the dashboard.',
      },
    },
    repairs: {
      title: 'Repairs tour',
      intro: {
        title: 'Repairs',
        body: 'Unplanned fixes are logged separately from scheduled maintenance, so your history stays honest.',
      },
    },
    documents: {
      title: 'Documents tour',
      intro: {
        title: 'Documents',
        body: 'Store OR/CR, insurance, and receipts, with expiry warnings before they lapse.',
      },
    },
    statistics: {
      title: 'Statistics tour',
      intro: {
        title: 'Statistics',
        body: 'Cost per kilometer, monthly spending, and fuel efficiency, computed from your logs.',
      },
    },
    search: {
      title: 'Search tour',
      intro: {
        title: 'Search',
        body: 'Find any record (services, fuel-ups, expenses, documents) from one box.',
      },
    },
    settings: {
      title: 'Settings tour',
      intro: {
        title: 'Settings',
        body: 'Theme, language, data & privacy, and this Help & Tutorials section.',
      },
    },
  },
  tips: {
    statistics: {
      title: 'Your riding, in numbers',
      body: 'Statistics are computed from your fuel, service, and expense logs. The more you log, the sharper they get.',
    },
    search: {
      title: 'Search everything',
      body: 'One box finds services, fuel-ups, expenses, and documents. Try a part name or a station.',
    },
    documents: {
      title: 'Paperwork, handled',
      body: 'Add OR/CR and insurance with expiry dates. Motrack warns you on the dashboard before they lapse.',
    },
  },
  help: {
    title: 'Help & Tutorials',
    toursSection: 'Guided tours',
    articlesSection: 'Guides',
    optionsSection: 'Options',
    status: {
      completed: 'Completed',
      inProgress: 'In progress',
      skipped: 'Skipped',
      notStarted: 'Not started',
    },
    replayA11y: 'Replay the {title}',
    tutorialMode: 'Tutorial Mode',
    tutorialModeCaption: 'Show all contextual tips and coach marks again. Your data is not affected.',
    showOfferAgain: 'Show the tour offer again',
    resetProgress: 'Reset tutorial progress',
    resetTitle: 'Reset tutorial progress?',
    resetBody: 'Tours, tips, and onboarding will be marked unseen. Motorcycles, maintenance, fuel, expenses, and documents are not touched.',
    resetConfirm: 'Reset progress',
    maintenanceDates: {
      rowTitle: 'How to track maintenance dates',
      title: 'How to track maintenance dates',
      whenTitle: 'When to log a service',
      whenBody: 'Log a maintenance item as soon as you finish it, like an oil change or a new set of brake pads. Motrack uses that date and odometer reading to plan the next one.',
      datesTitle: 'How dates work',
      datesBody: 'Each component remembers the last date it was serviced. You can update this anytime from the component screen in Maintenance, no need to set it during setup.',
      intervalsTitle: 'How odometer intervals work',
      intervalsBody: 'Every component has a recommended interval, in kilometers, months, or both. Motrack counts from your last log to tell you roughly when the next one is due.',
      remindersTitle: 'How reminders use this',
      remindersBody: 'When a component is due soon or overdue, Motrack shows it on your dashboard and can send a reminder. Keeping your odometer updated keeps these estimates accurate.',
    },
  },
  /** Canonical copy templates — NOTIFICATION_ENGINE.md §8. Use with `interpolate`. */
  notification: {
    due: {
      km: {
        title: '{component} due soon',
        body: '{bike}: {component} in about {remainingKm} km.',
      },
      time: {
        title: '{component} due {relativeDay}',
        body: '{bike}: {component} is due {relativeDay}.',
      },
      lowConfidence: {
        title: '{component} coming up',
        body: '{bike}: {component} is due around {date}. Update your odometer for a better estimate.',
      },
    },
    overdue: {
      title: '{component} overdue',
      body: '{bike}: {component} was due {overdueAmount} ago. A quick log takes 10 seconds.',
    },
    documentExpiry: {
      title: '{docType} expires {relativeDay}',
      body: '{bike}: renew before {date} to avoid penalties.',
    },
    relativeDay: {
      today: 'today',
      tomorrow: 'tomorrow',
      inDays: 'in {days} days',
    },
    settings: {
      title: 'Notification settings',
      masterToggle: 'Reminders enabled',
      fireTime: 'Reminder time',
      quietHours: 'Quiet hours',
      quietHoursCaption: 'Reminders due in this window move to your reminder time instead.',
      types: {
        maintenance_due: 'Maintenance due soon',
        maintenance_overdue: 'Overdue nags',
        document_expiry: 'Document expiry',
        backup_reminder: 'Backup reminders',
      },
      permissionDenied: 'Notifications are turned off for Motrack in your device settings.',
      openSystemSettings: 'Open system settings',
    },
  },
} as const;

/** Tiny interpolation helper until i18next lands (matches its {token} syntax). */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key];
    return value === undefined ? match : String(value);
  });
}
