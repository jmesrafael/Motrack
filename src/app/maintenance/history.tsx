import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SecondaryButton } from '@/components/SecondaryButton';
import { TimelineItem } from '@/components/TimelineItem';
import { componentIcon } from '@/features/maintenance/componentMeta';
import { useActiveBike } from '@/hooks/useActiveBike';
import { formatMoney, formatMonthDay } from '@/lib/format';
import { loadTimeline } from '@/services/TimelineService';

/** S-14 Maintenance history — reverse-chronological maintenance + repairs. */
export default function MaintenanceHistoryRoute() {
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
        <ScreenHeader title="History" />
        <EmptyState icon="maintenance" title="No motorcycle yet" body="Add a motorcycle first." />
      </Screen>
    );
  }

  if (entries.length === 0 && offset === 0) {
    return (
      <Screen scroll={false}>
        <ScreenHeader title="History" />
        <EmptyState
          icon="history"
          title="No maintenance records yet"
          body="Log a service and it will show up here, forming a searchable history over time."
          ctaLabel="Log a service"
          onCtaPress={() => router.push('/maintenance/log')}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="History" />
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
        <SecondaryButton label="Load more" onPress={() => setOffset((o) => o + 50)} block />
      ) : null}
    </Screen>
  );
}
