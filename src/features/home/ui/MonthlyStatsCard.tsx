import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
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
    total: {
      ...typeStyle(t.type.h1, t.text.primary),
      fontVariant: ['tabular-nums'],
    },
    deltaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s1,
      marginTop: 2,
    },
    delta: typeStyle(t.type.caption, t.text.tertiary),
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

  // Spending down = positive signal; up stays neutral — the app never scolds
  // (UI_UX_GUIDELINES.md §1.5). Icon + text together, never color alone.
  const trendIcon =
    month.trend === 'down'
      ? ({ name: 'trendDown', color: tokens.feedback.success.base } as const)
      : month.trend === 'up'
        ? ({ name: 'trendUp', color: tokens.icon.secondary } as const)
        : null;

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${strings.dashboard.month.title} ${month.label}: ${formatMoney(month.totalCentavos)}. ${month.deltaCaption}`}>
      <Text style={styles.total}>{formatMoneyWhole(month.totalCentavos)}</Text>
      <View style={styles.deltaRow}>
        {trendIcon !== null ? (
          <Icon name={trendIcon.name} size={tokens.iconSize.inline} color={trendIcon.color} />
        ) : null}
        <Text style={styles.delta}>{month.deltaCaption}</Text>
      </View>
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
            <Text style={styles.legendValue}>{formatMoneyWhole(category.amountCentavos)}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
