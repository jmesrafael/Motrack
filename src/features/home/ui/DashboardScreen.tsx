import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { AppHeader } from '@/components/AppHeader';
import { ListSection } from '@/components/ListSection';
import { ScheduleRow } from '@/components/ScheduleRow';
import { Screen } from '@/components/Screen';
import { TimelineItem } from '@/components/TimelineItem';
import { strings } from '@/i18n/strings';
import { formatKm, formatMoney, formatMonthDay } from '@/lib/format';
import type { ActivityVm } from '@/types/domain';
import { useDashboardData } from '../hooks/useDashboardData';
import { DocumentWarningBanner } from './DocumentWarningBanner';
import { GreetingBlock } from './GreetingBlock';
import { HealthHero } from './HealthHero';
import { MonthlyStatsCard } from './MonthlyStatsCard';
import { OdometerCard } from './OdometerCard';
import { QuickActionsGrid } from './QuickActionsGrid';
import { ThemeCycleButton } from './ThemeCycleButton';

function activityCaption(entry: ActivityVm): string {
  const date = formatMonthDay(entry.dateIso);
  return entry.odometerKm === undefined ? date : `${date} · ${formatKm(entry.odometerKm)}`;
}

/** S-04 Dashboard (SCREEN_SPECIFICATIONS.md) over fixture data. */
export function DashboardScreen() {
  const router = useRouter();
  const vm = useDashboardData();
  const { bike } = vm.data;

  // Every tap target leads somewhere honest: the pending sheet until its
  // real surface (switcher, S-05, S-11, S-12q, S-25, S-22) is approved.
  const openPending = useCallback(() => {
    router.push('/pending');
  }, [router]);

  return (
    <Screen>
      <AppHeader
        bikeLabel={bike.nickname}
        bikeA11yLabel={`${bike.nickname}, ${bike.brand} ${bike.model}. ${strings.dashboard.bikeChipA11y}`}
        onBikePress={openPending}
        reminderCount={vm.attentionCount}
        remindersA11yLabel={strings.dashboard.remindersA11y}
        onRemindersPress={openPending}
        trailing={<ThemeCycleButton />}
      />
      <GreetingBlock greeting={vm.greeting} riderName={vm.data.riderName} dateLabel={vm.dateLabel} />
      <HealthHero
        score={vm.data.healthScore}
        bandId={vm.bandId}
        bandLabel={vm.bandLabel}
        onPress={openPending}
      />
      <OdometerCard odometerKm={bike.odometerKm} asOfIso={bike.odometerAsOf} onUpdate={openPending} />
      {vm.data.documentWarning !== undefined ? (
        <DocumentWarningBanner message={vm.data.documentWarning.message} onPress={openPending} />
      ) : null}
      <ListSection title={strings.dashboard.nextMaintenance.title}>
        {vm.data.upcoming.map((schedule) => (
          <ScheduleRow
            key={schedule.id}
            icon={schedule.icon}
            label={schedule.label}
            status={schedule.status}
            statusLabel={strings.dashboard.nextMaintenance.due[schedule.status]}
            remainingText={schedule.remainingText}
            onPress={openPending}
          />
        ))}
      </ListSection>
      <QuickActionsGrid onAction={openPending} />
      <ListSection title={strings.dashboard.activity.title}>
        {vm.data.activity.map((entry) => (
          <TimelineItem
            key={entry.id}
            icon={entry.icon}
            title={entry.title}
            caption={activityCaption(entry)}
            amount={formatMoney(entry.amountCentavos)}
            isRepair={entry.kind === 'repair'}
            onPress={openPending}
          />
        ))}
      </ListSection>
      <MonthlyStatsCard month={vm.data.month} onPress={openPending} />
    </Screen>
  );
}
