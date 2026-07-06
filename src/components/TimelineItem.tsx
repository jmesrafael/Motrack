import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface TimelineItemProps {
  icon: IconName;
  title: string;
  caption: string;
  amount: string;
  /** Repairs render visually distinct: icon + accent edge (COMPONENT_LIBRARY.md). */
  isRepair?: boolean;
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
    repairEdge: {
      borderLeftWidth: 3,
      borderLeftColor: t.accent,
    },
    body: {
      flex: 1,
      gap: 2,
    },
    title: typeStyle(t.type.bodyStrong, t.text.primary),
    caption: typeStyle(t.type.caption, t.text.secondary),
    amount: {
      ...typeStyle(t.type.bodyStrong, t.text.primary),
      fontVariant: ['tabular-nums'],
    },
  }),
);

export function TimelineItem({
  icon,
  title,
  caption,
  amount,
  isRepair = false,
  onPress,
}: TimelineItemProps) {
  const styles = useStyles();
  const { tokens } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${caption}, ${amount}`}
      style={({ pressed }) => [styles.row, isRepair && styles.repairEdge, pressed && { opacity: 0.7 }]}>
      <View style={styles.iconWell}>
        <Icon
          name={icon}
          size={tokens.iconSize.listLeading}
          {...(isRepair ? { color: tokens.accent } : {})}
        />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.caption}>{caption}</Text>
      </View>
      <Text style={styles.amount}>{amount}</Text>
    </Pressable>
  );
}
