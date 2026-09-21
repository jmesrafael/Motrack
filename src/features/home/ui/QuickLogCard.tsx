import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Icon, type IconName } from '@/components/Icon';
import { StatusPill, type PillStatus } from '@/components/StatusPill';
import { formatKm, formatMonthDay } from '@/lib/format';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface QuickLogCardProps {
  icon: IconName;
  label: string;
  lastDate: string | null;
  lastOdometerKm: number | null;
  dueText: string;
  status: PillStatus;
  statusLabel: string;
  onPress: () => void;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    card: { width: 200, gap: t.space.s2 },
    header: { flexDirection: 'row', alignItems: 'center', gap: t.space.s2 },
    iconWell: {
      width: t.size.iconWell,
      height: t.size.iconWell,
      borderRadius: t.radius.md,
      backgroundColor: t.bg.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: { ...typeStyle(t.type.bodyStrong, t.text.primary), flex: 1 },
    lastLine: typeStyle(t.type.caption, t.text.secondary),
    dueLine: typeStyle(t.type.bodyStrong, t.text.primary),
  }),
);

/** Dashboard "Quick Logs" card (item 11): last done, next-due estimate, status (never color alone). */
export function QuickLogCard({
  icon,
  label,
  lastDate,
  lastOdometerKm,
  dueText,
  status,
  statusLabel,
  onPress,
}: QuickLogCardProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const lastLine =
    lastDate === null
      ? 'Never logged'
      : `Last: ${formatMonthDay(lastDate)}${lastOdometerKm !== null ? ` · ${formatKm(lastOdometerKm)}` : ''}`;

  return (
    <Card
      onPress={onPress}
      style={styles.card}
      accessibilityLabel={`${label}. ${lastLine}. ${dueText}. ${statusLabel}.`}>
      <View style={styles.header}>
        <View style={styles.iconWell}>
          <Icon name={icon} size={tokens.iconSize.listLeading} color={tokens.status[status].base} />
        </View>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text style={styles.lastLine} numberOfLines={1}>
        {lastLine}
      </Text>
      <Text style={styles.dueLine} numberOfLines={1}>
        {dueText}
      </Text>
      <StatusPill status={status} label={statusLabel} />
    </Card>
  );
}
