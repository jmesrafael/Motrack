import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ListSkeleton } from '@/components/Skeleton';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SegmentedControl } from '@/components/SegmentedControl';
import { StatCard } from '@/components/StatCard';
import { useActiveBike } from '@/hooks/useActiveBike';
import { formatKm, formatMoney } from '@/lib/format';
import { useStatsStore } from '@/stores/useStatsStore';
import { makeStyles } from '@/theme/styles';
import { useFeatureTip } from '@/tutorial/hooks/useFeatureTip';

const useStyles = makeStyles((t) =>
  StyleSheet.create({
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
    return (
      <Screen>
        <ScreenHeader title="Statistics" />
        <ListSkeleton rows={4} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Statistics" />
      <SegmentedControl segments={SCOPE_SEGMENTS} value={scope} onChange={setScope} />
      <View style={styles.grid}>
        <View style={styles.card}>
          <StatCard label="Km tracked" value={formatKm(stats.kmTracked)} icon="odometer" />
        </View>
        <View style={styles.card}>
          <StatCard label="Overall spend" value={formatMoney(stats.overallSpendCentavos)} icon="expense" />
        </View>
        <View style={styles.card}>
          <StatCard label="Maintenance" value={formatMoney(stats.maintenanceSpendCentavos)} icon="maintenance" />
        </View>
        <View style={styles.card}>
          <StatCard label="Fuel" value={formatMoney(stats.fuelSpendCentavos)} icon="fuel" />
        </View>
        <View style={styles.card}>
          <StatCard label="Repairs" value={formatMoney(stats.repairSpendCentavos)} icon="repair" />
        </View>
        <View style={styles.card}>
          <StatCard label="Oil changes" value={String(stats.oilChangeCount)} icon="engineOil" />
        </View>
        <View style={styles.card}>
          <StatCard
            label="Avg monthly spend"
            value={stats.averageMonthlySpendCentavos !== null ? formatMoney(stats.averageMonthlySpendCentavos) : '—'}
            icon="trendingUp"
          />
        </View>
        <View style={styles.card}>
          <StatCard
            label="Cost/km"
            value={stats.costPerKmCentavos !== null ? formatMoney(stats.costPerKmCentavos) : '—'}
            icon="trendingUp"
          />
        </View>
        {scope === 'bike' ? (
          <View style={styles.card}>
            <StatCard
              label="Avg consumption"
              value={stats.averageKmPerLiter !== null ? `${stats.averageKmPerLiter.toFixed(1)} km/L` : '—'}
              icon="fuel"
            />
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
