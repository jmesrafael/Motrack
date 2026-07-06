import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { strings } from '@/i18n/strings';
import { formatMoney, formatMoneyWhole } from '@/lib/format';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';
import type { MonthSummaryVm } from '@/types/domain';

export interface MonthlyStatsCardProps {
  month: MonthSummaryVm;
  onPress: () => void;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
    },
    title: typeStyle(t.type.caption, t.text.secondary),
    monthLabel: typeStyle(t.type.caption, t.text.tertiary),
    total: {
      ...typeStyle(t.type.h1, t.text.primary),
      fontVariant: ['tabular-nums'],
      marginTop: t.space.s1,
    },
    delta: {
      ...typeStyle(t.type.caption, t.text.tertiary),
      marginTop: 2,
    },
    // Stacked category bar with 2px surface gaps (chart standards, DESIGN_SYSTEM.md §3).
    bar: {
      flexDirection: 'row',
      height: 8,
      borderRadius: t.radius.full,
      overflow: 'hidden',
      marginTop: t.space.s4,
      gap: 2,
    },
    segment: {
      height: 8,
    },
    legend: {
      marginTop: t.space.s3,
      gap: t.space.s2,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s2,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: t.radius.full,
    },
    legendLabel: {
      ...typeStyle(t.type.caption, t.text.secondary),
      flex: 1,
    },
    legendValue: {
      ...typeStyle(t.type.caption, t.text.primary),
      fontVariant: ['tabular-nums'],
    },
  }),
);

export function MonthlyStatsCard({ month, onPress }: MonthlyStatsCardProps) {
  const styles = useStyles();
  const { tokens } = useTheme();

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${strings.dashboard.month.title} ${month.label}: ${formatMoney(month.totalCentavos)}`}>
      <View style={styles.header}>
        <Text style={styles.title}>{strings.dashboard.month.title}</Text>
        <Text style={styles.monthLabel}>{month.label}</Text>
      </View>
      <Text style={styles.total}>{formatMoneyWhole(month.totalCentavos)}</Text>
      <Text style={styles.delta}>{month.deltaCaption}</Text>
      <View style={styles.bar}>
        {month.categories.map((category) => (
          <View
            key={category.id}
            style={[
              styles.segment,
              {
                flex: category.amountCentavos,
                backgroundColor: tokens.chart[category.slot],
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.legend}>
        {month.categories.map((category) => (
          <View key={category.id} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: tokens.chart[category.slot] }]} />
            <Text style={styles.legendLabel}>{category.label}</Text>
            <Text style={styles.legendValue}>{formatMoney(category.amountCentavos)}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
