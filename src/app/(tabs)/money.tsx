import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SegmentedControl } from '@/components/SegmentedControl';
import { StatCard } from '@/components/StatCard';
import { TimelineItem } from '@/components/TimelineItem';
import { useActiveBike } from '@/hooks/useActiveBike';
import { strings } from '@/i18n/strings';
import { formatMoney, formatMonthDay } from '@/lib/format';
import { useMoneyStore } from '@/stores/useMoneyStore';
import { makeStyles, typeStyle } from '@/theme/styles';

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    title: typeStyle(t.type.h1, t.text.primary),
    total: { ...typeStyle(t.type.display, t.text.primary), fontVariant: ['tabular-nums'] },
  }),
);

const SEGMENTS = [
  { value: 'expenses' as const, label: 'Expenses' },
  { value: 'fuel' as const, label: 'Fuel' },
];

/** S-22 Money tab root — Expenses/Fuel segments. */
export default function MoneyRoute() {
  const styles = useStyles();
  const router = useRouter();
  const { activeBike } = useActiveBike();
  const [segment, setSegment] = useState<'expenses' | 'fuel'>('expenses');
  const money = useMoneyStore();

  useEffect(() => {
    if (activeBike !== null) {
      money.load(activeBike.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBike?.id]);

  if (activeBike === null) {
    return (
      <Screen scroll={false}>
        <EmptyState icon="expense" title="No motorcycle yet" body="Add a motorcycle to track spending." />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Money</Text>
      <SegmentedControl segments={SEGMENTS} value={segment} onChange={setSegment} />
      {segment === 'expenses' ? (
        <>
          <Text style={styles.total}>{formatMoney(money.monthTotalCentavos)}</Text>
          <PrimaryButton label="+ Expense" onPress={() => router.push('/expense/log')} />
          {money.unified.map((row) => (
            <TimelineItem
              key={`${row.source}-${row.id}`}
              icon={row.source === 'fuel' ? 'fuel' : row.source === 'repair' ? 'repair' : 'expense'}
              title={strings.categories[row.category]}
              caption={`${formatMonthDay(row.date)}${row.label !== null ? ` · ${row.label}` : ''}`}
              amount={formatMoney(row.amountCentavos)}
              isRepair={row.source === 'repair'}
              onPress={() => {
                if (row.source === 'expense') {
                  router.push(`/expense/log?expenseId=${row.id}`);
                } else if (row.source === 'fuel') {
                  router.push(`/fuel/log?fuelLogId=${row.id}`);
                } else if (row.source === 'repair') {
                  router.push(`/repair/log?repairId=${row.id}`);
                } else {
                  router.push(`/maintenance/log?recordId=${row.id}`);
                }
              }}
            />
          ))}
        </>
      ) : (
        <>
          <PrimaryButton label="+ Fuel" onPress={() => router.push('/fuel/log')} />
          <StatCard
            label="Avg consumption"
            value={money.averageKmPerLiter !== null ? `${money.averageKmPerLiter.toFixed(1)} km/L` : '—'}
          />
          <StatCard
            label="Cost/km"
            value={money.fuelCostPerKmCentavos !== null ? formatMoney(money.fuelCostPerKmCentavos) : '—'}
          />
          {money.fuelLogs.map((log) => (
            <TimelineItem
              key={log.id}
              icon="fuel"
              title={log.station ?? 'Fuel'}
              caption={`${formatMonthDay(log.fuelDate)} · ${log.liters} L`}
              amount={formatMoney(log.totalCostCentavos)}
              onPress={() => router.push(`/fuel/log?fuelLogId=${log.id}`)}
            />
          ))}
        </>
      )}
    </Screen>
  );
}
