import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { SegmentedControl } from '@/components/SegmentedControl';
import { StatCard } from '@/components/StatCard';
import { useActiveBike } from '@/hooks/useActiveBike';
import { formatKm, formatMoney } from '@/lib/format';
import { useStatsStore } from '@/stores/useStatsStore';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useFeatureTip } from '@/tutorial/hooks/useFeatureTip';

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    title: typeStyle(t.type.h1, t.text.primary),
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space.s3 },
    card: { width: '47%' },
  }),
);

const SCOPE_SEGMENTS = [
  { value: 'bike' as const, label: 'This bike' },
  { value: 'all' as const, label: 'All bikes' },
];

/** S-28 Statistics — totals, averages, per-bike or all-bikes scope. */
export default function StatisticsRoute() {
  const styles = useStyles();
  useFeatureTip('statistics');
  const { activeBike } = useActiveBike();
  const [scope, setScope] = useState<'bike' | 'all'>('bike');
  const stats = useStatsStore((s) => s.stats);
  const status = useStatsStore((s) => s.status);
  const load = useStatsStore((s) => s.load);

  useEffect(() => {
    load(scope, activeBike?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, activeBike?.id]);

  if (status !== 'ready' || stats === null) {
    return null;
  }

  return (
    <Screen>
      <Text style={styles.title}>Statistics</Text>
      <SegmentedControl segments={SCOPE_SEGMENTS} value={scope} onChange={setScope} />
      <View style={styles.grid}>
        <View style={styles.card}>
          <StatCard label="Km tracked" value={formatKm(stats.kmTracked)} />
        </View>
        <View style={styles.card}>
          <StatCard label="Overall spend" value={formatMoney(stats.overallSpendCentavos)} />
        </View>
        <View style={styles.card}>
          <StatCard label="Maintenance" value={formatMoney(stats.maintenanceSpendCentavos)} />
        </View>
        <View style={styles.card}>
          <StatCard label="Fuel" value={formatMoney(stats.fuelSpendCentavos)} />
        </View>
        <View style={styles.card}>
          <StatCard label="Repairs" value={formatMoney(stats.repairSpendCentavos)} />
        </View>
        <View style={styles.card}>
          <StatCard label="Oil changes" value={String(stats.oilChangeCount)} />
        </View>
        <View style={styles.card}>
          <StatCard
            label="Avg monthly spend"
            value={stats.averageMonthlySpendCentavos !== null ? formatMoney(stats.averageMonthlySpendCentavos) : '—'}
          />
        </View>
        <View style={styles.card}>
          <StatCard label="Cost/km" value={stats.costPerKmCentavos !== null ? formatMoney(stats.costPerKmCentavos) : '—'} />
        </View>
        {scope === 'bike' ? (
          <View style={styles.card}>
            <StatCard
              label="Avg consumption"
              value={stats.averageKmPerLiter !== null ? `${stats.averageKmPerLiter.toFixed(1)} km/L` : '—'}
            />
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
