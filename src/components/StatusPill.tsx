import { StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

/** Full status ramp (DESIGN_SYSTEM.md §2.1); due statuses use the middle four. */
export type PillStatus = 'excellent' | 'good' | 'dueSoon' | 'overdue' | 'critical' | 'neutral';

export interface StatusPillProps {
  status: PillStatus;
  label: string;
}

/** Triple encoding: color + icon + text — never color alone (UI_UX_GUIDELINES.md §1.2). */
const STATUS_ICONS: Record<PillStatus, IconName> = {
  excellent: 'statusGood',
  good: 'statusGood',
  dueSoon: 'statusDueSoon',
  overdue: 'statusOverdue',
  critical: 'statusCritical',
  neutral: 'statusNeutral',
};

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s1,
      borderRadius: t.radius.full,
      paddingHorizontal: t.space.s2,
      paddingVertical: t.space.s1,
    },
    label: typeStyle(t.type.caption, t.text.primary),
  }),
);

export function StatusPill({ status, label }: StatusPillProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const color = tokens.status[status];

  return (
    <View style={[styles.pill, { backgroundColor: color.bg }]}>
      <Icon name={STATUS_ICONS[status]} size={tokens.iconSize.inline} color={color.base} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
