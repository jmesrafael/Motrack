import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ScheduleRow } from '@/components/ScheduleRow';
import { SecondaryButton } from '@/components/SecondaryButton';
import { ScheduleRepository } from '@/db/repositories/ScheduleRepository';
import { componentIcon, componentLabel } from '@/features/maintenance/componentMeta';
import { strings } from '@/i18n/strings';
import { addDays, todayIso } from '@/lib/dates';
import { useReminderStore, type ReminderItem } from '@/stores/useReminderStore';
import { makeStyles, typeStyle } from '@/theme/styles';
import type { ComponentType } from '@/types/enums';

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    title: typeStyle(t.type.h1, t.text.primary),
    sectionTitle: { ...typeStyle(t.type.h2, t.text.primary), marginTop: t.space.s4 },
    itemGroup: { gap: t.space.s1 },
  }),
);

const BUCKET_LABEL: Record<ReminderItem['bucket'], string> = {
  overdue: 'Overdue',
  thisWeek: 'This week',
  later: 'Later',
};

/** S-05 Reminders list — overdue/due-soon items across all non-archived bikes, in-app only. */
export default function RemindersRoute() {
  const styles = useStyles();
  const router = useRouter();
  const items = useReminderStore((s) => s.items);
  const status = useReminderStore((s) => s.status);
  const load = useReminderStore((s) => s.load);

  useEffect(() => {
    if (status === 'idle') {
      load();
    }
  }, [status, load]);

  if (items.length === 0) {
    return (
      <Screen scroll={false}>
        <EmptyState icon="reminder" title="All caught up" body="Nothing due right now." />
      </Screen>
    );
  }

  const buckets: ReminderItem['bucket'][] = ['overdue', 'thisWeek', 'later'];

  return (
    <Screen>
      <Text style={styles.title}>Reminders</Text>
      {buckets.map((bucket) => {
        const bucketItems = items.filter((i) => i.bucket === bucket);
        if (bucketItems.length === 0) {
          return null;
        }
        return (
          <>
            <Text style={styles.sectionTitle} key={`${bucket}-title`}>
              {BUCKET_LABEL[bucket]}
            </Text>
            {bucketItems.map((item) => {
              const componentType = item.schedule.componentType as ComponentType;
              return (
                <View key={item.schedule.id} style={styles.itemGroup}>
                  <ScheduleRow
                    icon={componentIcon(componentType)}
                    label={`${item.bikeNickname} · ${componentLabel(componentType, item.schedule.customName)}`}
                    status={item.bucket === 'overdue' ? 'overdue' : 'dueSoon'}
                    statusLabel={strings.dashboard.nextMaintenance.due[item.bucket === 'overdue' ? 'overdue' : 'dueSoon']}
                    remainingText={
                      item.remainingKm !== null
                        ? `in ${item.remainingKm} km`
                        : item.remainingDays !== null
                          ? `in ${item.remainingDays} days`
                          : ''
                    }
                    onPress={() => router.push(`/maintenance/log?scheduleId=${item.schedule.id}`)}
                  />
                  {bucket !== 'overdue' ? (
                    <SecondaryButton
                      label="Snooze 1 week"
                      onPress={() => {
                        ScheduleRepository.update(item.schedule.id, { snoozedUntil: addDays(todayIso(), 7) });
                        load();
                      }}
                    />
                  ) : null}
                </View>
              );
            })}
          </>
        );
      })}
    </Screen>
  );
}
