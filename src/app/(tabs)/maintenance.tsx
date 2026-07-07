import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ScheduleRow } from '@/components/ScheduleRow';
import { Screen } from '@/components/Screen';
import { SecondaryButton } from '@/components/SecondaryButton';
import { componentIcon, componentLabel } from '@/features/maintenance/componentMeta';
import { useSchedules } from '@/features/maintenance/hooks/useSchedules';
import { formatRemaining } from '@/features/maintenance/remainingText';
import { useActiveBike } from '@/hooks/useActiveBike';
import { strings } from '@/i18n/strings';
import { makeStyles, typeStyle } from '@/theme/styles';
import { TutorialAnchor } from '@/tutorial/ui/TutorialAnchor';
import type { ComponentType } from '@/types/enums';

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    title: typeStyle(t.type.h1, t.text.primary),
    summary: typeStyle(t.type.caption, t.text.secondary),
    sectionTitle: { ...typeStyle(t.type.h2, t.text.primary), marginTop: t.space.s4 },
    listAnchor: { gap: t.space.s4 },
  }),
);

/** S-10 Maintenance overview — all components' status for the active bike (R-04). */
export default function MaintenanceRoute() {
  const styles = useStyles();
  const router = useRouter();
  const { activeBike } = useActiveBike();
  const { items } = useSchedules(activeBike?.id ?? null, activeBike?.currentOdometerKm ?? 0);

  if (activeBike === null) {
    return (
      <Screen scroll={false}>
        <EmptyState icon="maintenance" title="No motorcycle yet" body="Add a motorcycle to track its maintenance." />
      </Screen>
    );
  }

  const enabled = items.filter((i) => i.schedule.isEnabled === 1);
  const disabled = items.filter((i) => i.schedule.isEnabled === 0);
  const sorted = [...enabled].sort((a, b) => (b.status.ratio ?? -1) - (a.status.ratio ?? -1));
  const overdueCount = enabled.filter((i) => i.status.status === 'overdue').length;
  const dueSoonCount = enabled.filter((i) => i.status.status === 'dueSoon').length;

  return (
    <Screen tutorialScrollId="maintenance">
      <Text style={styles.title}>Maintenance</Text>
      <Text style={styles.summary}>
        {overdueCount} overdue · {dueSoonCount} due soon
      </Text>
      <TutorialAnchor id="maintenance.list" style={styles.listAnchor}>
        {sorted.slice(0, 4).map((item) => {
          const componentType = item.schedule.componentType as ComponentType;
          return (
            <ScheduleRow
              key={item.schedule.id}
              icon={componentIcon(componentType)}
              label={componentLabel(componentType, item.schedule.customName)}
              status={item.status.status}
              statusLabel={strings.dashboard.nextMaintenance.due[item.status.status]}
              remainingText={formatRemaining(item.status)}
              onPress={() => router.push(`/maintenance/component/${item.schedule.id}`)}
            />
          );
        })}
      </TutorialAnchor>
      {sorted.slice(4).map((item) => {
        const componentType = item.schedule.componentType as ComponentType;
        return (
          <ScheduleRow
            key={item.schedule.id}
            icon={componentIcon(componentType)}
            label={componentLabel(componentType, item.schedule.customName)}
            status={item.status.status}
            statusLabel={strings.dashboard.nextMaintenance.due[item.status.status]}
            remainingText={formatRemaining(item.status)}
            onPress={() => router.push(`/maintenance/component/${item.schedule.id}`)}
          />
        );
      })}
      {disabled.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Disabled</Text>
          {disabled.map((item) => {
            const componentType = item.schedule.componentType as ComponentType;
            return (
              <ScheduleRow
                key={item.schedule.id}
                icon={componentIcon(componentType)}
                label={componentLabel(componentType, item.schedule.customName)}
                status="neutral"
                statusLabel="Disabled"
                remainingText=""
                onPress={() => router.push(`/maintenance/component/${item.schedule.id}`)}
              />
            );
          })}
        </>
      ) : null}
      <SecondaryButton label="+ Custom component" onPress={() => router.push('/maintenance/custom')} />
      <SecondaryButton label="History" onPress={() => router.push('/maintenance/history')} />
      <View />
    </Screen>
  );
}
