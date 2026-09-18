import { StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

/** Full status ramp (DESIGN_SYSTEM.md §2.1); due statuses use the middle four. */
export type PillStatus = 'excellent' | 'good' | 'dueSoon' | 'overdue' | 'critical' | 'neutral';

export interface StatusPillProps {
  status: PillStatus;
  label: string;
  /** Outline variant for use on tinted backgrounds (hero cards, chips row). */
  variant?: 'solid' | 'outline';
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
      paddingHorizontal: t.space.s3,
      paddingVertical: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: t.radius.full,
    },
    label: typeStyle(t.type.captionStrong, t.text.primary, t.type.family),
  }),
);

export function StatusPill({ status, label, variant = 'solid' }: StatusPillProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const color = tokens.status[status];

  const containerStyle =
    variant === 'solid'
      ? { backgroundColor: color.bg }
      : { backgroundColor: 'transparent', borderWidth: 1, borderColor: color.base };

  return (
    <View style={[styles.pill, containerStyle]}>
      <Icon name={STATUS_ICONS[status]} size={tokens.iconSize.inline} color={color.base} />
      <Text style={[styles.label, { color: variant === 'solid' ? tokens.text.primary : color.base }]}>{label}</Text>
    </View>
  );
}

/** Small dot-only variant for tight chip rows (dashboard health chips). */
export function StatusDotChip({ status, label }: { status: PillStatus; label: string }) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const color = tokens.status[status];
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: tokens.bg.surfaceVariant, borderWidth: 1, borderColor: tokens.border.divider },
      ]}>
      <View style={[styles.dot, { backgroundColor: color.base }]} />
      <Text style={[styles.label, { color: tokens.text.secondary }]}>{label}</Text>
    </View>
  );
}
