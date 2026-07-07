import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { TimelineItem } from '@/components/TimelineItem';
import { componentIcon } from '@/features/maintenance/componentMeta';
import { useActiveBike } from '@/hooks/useActiveBike';
import { formatMoney, formatMonthDay } from '@/lib/format';
import { loadTimeline } from '@/services/TimelineService';
import { makeStyles, typeStyle } from '@/theme/styles';

const useStyles = makeStyles((t) => ({
  title: typeStyle(t.type.h1, t.text.primary),
}));

/** S-14 Maintenance history — reverse-chronological maintenance + repairs. */
export default function MaintenanceHistoryRoute() {
  const styles = useStyles();
  const router = useRouter();
  const { activeBike } = useActiveBike();
  const [offset, setOffset] = useState(0);

  const entries = useMemo(
    () =>
      activeBike !== null
        ? loadTimeline(activeBike.id, { scope: 'history', limit: 50, offset })
        : [],
    [activeBike, offset],
  );

  if (activeBike === null) {
    return (
      <Screen scroll={false}>
        <EmptyState icon="maintenance" title="No motorcycle yet" body="Add a motorcycle first." />
      </Screen>
    );
  }

  if (entries.length === 0 && offset === 0) {
    return (
      <Screen scroll={false}>
        <EmptyState icon="maintenance" title="No history yet" body="Log a service to see it here." />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>History</Text>
      {entries.map((entry) => (
        <TimelineItem
          key={entry.id}
          icon={entry.componentType !== null ? componentIcon(entry.componentType) : 'repair'}
          title={entry.title}
          caption={
            entry.odometerKm !== null
              ? `${formatMonthDay(entry.date)} · ${entry.odometerKm.toLocaleString('en-PH')} km`
              : formatMonthDay(entry.date)
          }
          amount={entry.amountCentavos !== null ? formatMoney(entry.amountCentavos) : '—'}
          isRepair={entry.kind === 'repair'}
          onPress={() =>
            router.push(
              entry.kind === 'repair' ? `/repair/log?repairId=${entry.id}` : `/maintenance/log?recordId=${entry.id}`,
            )
          }
        />
      ))}
      {entries.length === 50 ? (
        <TimelineItem
          icon="maintenance"
          title="Load more"
          caption=""
          amount=""
          onPress={() => setOffset((o) => o + 50)}
        />
      ) : null}
    </Screen>
  );
}
