import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface AppHeaderProps {
  /** Screen greeting/title — quiet on purpose: the hero below owns the screen. */
  title: string;
  subtitle: string;
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
    titleBlock: {
      flex: 1,
      gap: 2,
    },
    title: typeStyle(t.type.h2, t.text.primary),
    subtitle: typeStyle(t.type.caption, t.text.tertiary),
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
  title,
  subtitle,
  reminderCount,
  remindersA11yLabel,
  onRemindersPress,
  trailing,
}: AppHeaderProps) {
  const styles = useStyles();
  const { tokens } = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.titleBlock}>
        <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
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
