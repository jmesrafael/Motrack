import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface AppHeaderProps {
  bikeLabel: string;
  bikeA11yLabel: string;
  onBikePress: () => void;
  reminderCount: number;
  remindersA11yLabel: string;
  onRemindersPress: () => void;
  /** Extra header action slot (validation phase hosts the theme switcher). */
  trailing?: ReactNode;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s2,
    },
    bikeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s2,
      minHeight: 44,
      paddingHorizontal: t.space.s3,
      borderRadius: t.radius.full,
      backgroundColor: t.bg.surfaceVariant,
      flexShrink: 1,
    },
    bikeLabel: {
      ...typeStyle(t.type.bodyStrong, t.text.primary),
      flexShrink: 1,
    },
    spacer: {
      flex: 1,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: t.radius.full,
      backgroundColor: t.bg.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      position: 'absolute',
      top: 6,
      right: 6,
      minWidth: 16,
      height: 16,
      borderRadius: t.radius.full,
      backgroundColor: t.feedback.error.base,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 3,
    },
    badgeText: {
      ...typeStyle(t.type.label, t.primary.on),
      lineHeight: 12,
    },
  }),
);

export function AppHeader({
  bikeLabel,
  bikeA11yLabel,
  onBikePress,
  reminderCount,
  remindersA11yLabel,
  onRemindersPress,
  trailing,
}: AppHeaderProps) {
  const styles = useStyles();
  const { tokens } = useTheme();

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onBikePress}
        accessibilityRole="button"
        accessibilityLabel={bikeA11yLabel}
        style={({ pressed }) => [styles.bikeChip, pressed && { opacity: 0.7 }]}>
        <Icon name="motorcycle" size={tokens.iconSize.listLeading} />
        <Text style={styles.bikeLabel} numberOfLines={1}>
          {bikeLabel}
        </Text>
        <Icon name="chevronDown" size={tokens.iconSize.inline} color={tokens.icon.secondary} />
      </Pressable>
      <View style={styles.spacer} />
      {trailing}
      <Pressable
        onPress={onRemindersPress}
        accessibilityRole="button"
        accessibilityLabel={remindersA11yLabel}
        style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}>
        <Icon name="reminder" size={tokens.iconSize.md} />
        {reminderCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{String(reminderCount)}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}
