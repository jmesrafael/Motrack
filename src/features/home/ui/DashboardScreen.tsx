import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { ListSection } from '@/components/ListSection';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScheduleRow } from '@/components/ScheduleRow';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { TimelineItem } from '@/components/TimelineItem';
import { useReminderStore } from '@/stores/useReminderStore';
import { strings } from '@/i18n/strings';
import { formatKm, formatMoney, formatMonthDay } from '@/lib/format';
import { makeStyles } from '@/theme/styles';
import { TutorialAnchor } from '@/tutorial/ui/TutorialAnchor';
import { ResumeDialog, TourOfferDialog } from '@/tutorial/ui/TutorialDialogs';
import type { ActivityVm } from '@/types/domain';
import { useDashboardData } from '../hooks/useDashboardData';
import { useTourOffer } from '../hooks/useTourOffer';
import { BikeHeroCard } from './BikeHeroCard';
import { DocumentWarningBanner } from './DocumentWarningBanner';
import { MonthlyStatsCard } from './MonthlyStatsCard';
import { QuickActionsGrid } from './QuickActionsGrid';
import { ThemeCycleButton } from './ThemeCycleButton';

function activityCaption(entry: ActivityVm): string {
  const date = formatMonthDay(entry.dateIso);
  return entry.odometerKm === undefined ? date : `${date} · ${formatKm(entry.odometerKm)}`;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    section: {
      gap: t.space.s2,
    },
  }),
);

/** S-04 Dashboard (SCREEN_SPECIFICATIONS.md) over live repository-backed data. */
export function DashboardScreen() {
  const styles = useStyles();
  const router = useRouter();
  const vm = useDashboardData();
  const reminderCount = useReminderStore((s) => s.items.length);
  const reminderStatus = useReminderStore((s) => s.status);
  const loadReminders = useReminderStore((s) => s.load);
  const tourOffer = useTourOffer(vm.hasBike);

  useEffect(() => {
    if (reminderStatus === 'idle') {
      loadReminders();
    }
  }, [reminderStatus, loadReminders]);

  const goGarage = useCallback(() => router.push('/garage'), [router]);
  const goReminders = useCallback(() => router.push('/reminders'), [router]);
  const goMaintenance = useCallback(() => router.push('/(tabs)/maintenance'), [router]);
  const goOdometer = useCallback(() => router.push('/odometer'), [router]);
  const goMoney = useCallback(() => router.push('/(tabs)/money'), [router]);

  if (!vm.hasBike || vm.data === null) {
    return (
      <Screen scroll={false}>
        <EmptyState
          icon="motorcycle"
          title="Add your first motorcycle"
          body="Motrack tracks maintenance, fuel, and expenses per bike — add one to get started."
        />
        <PrimaryButton label="Add motorcycle" onPress={() => router.push('/bike/new')} />
      </Screen>
    );
  }

  const { bike } = vm.data;

  return (
    <Screen tutorialScrollId="dashboard">
      <AppHeader
        title={vm.greeting}
        subtitle={vm.dateLabel}
        reminderCount={reminderCount}
        remindersA11yLabel={strings.dashboard.remindersA11y}
        onRemindersPress={goReminders}
        trailing={<ThemeCycleButton />}
      />
      <BikeHeroCard
        bike={bike}
        score={vm.data.healthScore}
        bandId={vm.bandId}
        bandLabel={vm.bandLabel}
        onSwitchBike={goGarage}
        onHealthPress={goMaintenance}
        onUpdateOdometer={goOdometer}
        bikeChipAnchorId="dashboard.bikeChip"
        healthAnchorId="dashboard.healthHero"
        odometerAnchorId="dashboard.odometerCard"
      />
      {vm.data.documentWarning !== undefined ? (
        <DocumentWarningBanner
          message={vm.data.documentWarning.message}
          onPress={() => router.push('/documents')}
        />
      ) : null}
      <ListSection
        title={strings.dashboard.nextMaintenance.title}
        actionLabel={strings.dashboard.nextMaintenance.seeAll}
        onAction={goMaintenance}>
        {vm.data.upcoming.length === 0
          ? null
          : vm.data.upcoming.map((schedule) => (
              <ScheduleRow
                key={schedule.id}
                icon={schedule.icon}
                label={schedule.label}
                status={schedule.status}
                statusLabel={strings.dashboard.nextMaintenance.due[schedule.status]}
                remainingText={schedule.remainingText}
                onPress={() => router.push(`/maintenance/component/${schedule.id}`)}
              />
            ))}
      </ListSection>
      <TutorialAnchor id="dashboard.quickActions">
        <QuickActionsGrid
          onAction={(actionId) => {
            if (actionId === 'log-service') {
              router.push('/maintenance/log');
            } else if (actionId === 'add-fuel') {
              router.push('/fuel/log');
            } else if (actionId === 'add-expense') {
              router.push('/expense/log');
            } else {
              goOdometer();
            }
          }}
        />
      </TutorialAnchor>
      <ListSection title={strings.dashboard.activity.title}>
        {vm.data.activity.map((entry) => (
          <TimelineItem
            key={entry.id}
            icon={entry.icon}
            title={entry.title}
            caption={activityCaption(entry)}
            amount={formatMoney(entry.amountCentavos)}
            isRepair={entry.kind === 'repair'}
            onPress={goMoney}
          />
        ))}
      </ListSection>
      <View style={styles.section}>
        <SectionHeader title={strings.dashboard.month.title} trailingLabel={vm.data.month.label} />
        <MonthlyStatsCard month={vm.data.month} onPress={goMoney} />
      </View>
      <TourOfferDialog
        visible={tourOffer.offerVisible}
        onStart={tourOffer.onStart}
        onLater={tourOffer.onLater}
        onNever={tourOffer.onNever}
      />
      <ResumeDialog
        visible={tourOffer.resumeVisible}
        onResume={tourOffer.onResume}
        onRestart={tourOffer.onRestart}
        onDismiss={tourOffer.onDismissResume}
      />
    </Screen>
  );
}
