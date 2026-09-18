import { StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { StatusPill, type PillStatus } from '@/components/StatusPill';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface ScheduleRowProps {
  icon: IconName;
  label: string;
  status: PillStatus;
  statusLabel: string;
  remainingText: string;
  onPress: () => void;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s3,
      minHeight: t.size.row,
      paddingHorizontal: t.space.s4,
      paddingVertical: t.space.s3,
    },
    iconWell: {
      width: t.size.iconWell,
      height: t.size.iconWell,
      borderRadius: t.radius.md,
      backgroundColor: t.bg.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      flex: 1,
      gap: 2,
    },
    label: typeStyle(t.type.bodyStrong, t.text.primary, t.type.family),
    remaining: typeStyle(t.type.caption, t.text.secondary, t.type.family),
  }),
);

export function ScheduleRow({ icon, label, status, statusLabel, remainingText, onPress }: ScheduleRowProps) {
  const styles = useStyles();
  const { tokens } = useTheme();

  return (
    <PressableScale
      onPress={onPress}
      dim
      scaleTo={0.99}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${statusLabel}, ${remainingText}`}
      style={styles.row}>
      <View style={styles.iconWell}>
        <Icon name={icon} size={tokens.iconSize.listLeading} color={tokens.status[status].base} />
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.remaining}>{remainingText}</Text>
      </View>
      <StatusPill status={status} label={statusLabel} />
    </PressableScale>
  );
}
