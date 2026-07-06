import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
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
      minHeight: 56,
      paddingHorizontal: t.space.s4,
      paddingVertical: t.space.s3,
    },
    iconWell: {
      width: 36,
      height: 36,
      borderRadius: t.radius.full,
      backgroundColor: t.bg.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      flex: 1,
      gap: 2,
    },
    label: typeStyle(t.type.bodyStrong, t.text.primary),
    remaining: typeStyle(t.type.caption, t.text.secondary),
  }),
);

export function ScheduleRow({
  icon,
  label,
  status,
  statusLabel,
  remainingText,
  onPress,
}: ScheduleRowProps) {
  const styles = useStyles();
  const { tokens } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${statusLabel}, ${remainingText}`}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
      <View style={styles.iconWell}>
        <Icon name={icon} size={tokens.iconSize.listLeading} />
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.remaining}>{remainingText}</Text>
      </View>
      <StatusPill status={status} label={statusLabel} />
    </Pressable>
  );
}
