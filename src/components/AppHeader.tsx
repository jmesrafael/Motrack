import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { PressableScale } from '@/components/PressableScale';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';
import { TutorialAnchor } from '@/tutorial/ui/TutorialAnchor';

export interface AppHeaderProps {
  bikeLabel: string;
  bikeA11yLabel: string;
  onBikePress: () => void;
  reminderCount: number;
  remindersA11yLabel: string;
  onRemindersPress: () => void;
  /** Extra header action slot (theme switcher). */
  trailing?: ReactNode;
  /** Registers the bike chip as a tutorial target (dashboard tour). */
  bikeChipAnchorId?: string;
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
      minHeight: t.size.buttonMd,
      paddingHorizontal: t.space.s3,
      paddingVertical: t.space.s1,
      borderRadius: t.radius.full,
      backgroundColor: t.bg.surfaceVariant,
      flexShrink: 1,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: t.primary.base,
    },
    bikeLabel: {
      ...typeStyle(t.type.bodyStrong, t.text.primary, t.type.family),
      flexShrink: 1,
    },
    chipWrap: {
      flexShrink: 1,
    },
    spacer: {
      flex: 1,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s2,
    },
  }),
);

/** Persistent motorcycle context (bike chip) + reminders/theme actions — the app-wide top bar. */
export function AppHeader({
  bikeLabel,
  bikeA11yLabel,
  onBikePress,
  reminderCount,
  remindersA11yLabel,
  onRemindersPress,
  trailing,
  bikeChipAnchorId,
}: AppHeaderProps) {
  const styles = useStyles();
  const { tokens } = useTheme();

  const bikeChip = (
    <PressableScale
      onPress={onBikePress}
      scaleTo={0.96}
      accessibilityRole="button"
      accessibilityLabel={bikeA11yLabel}
      style={styles.bikeChip}>
      <View style={styles.dot} />
      <Text style={styles.bikeLabel} numberOfLines={1}>
        {bikeLabel}
      </Text>
      <Icon name="chevronDown" size={tokens.iconSize.inline} color={tokens.icon.secondary} />
    </PressableScale>
  );

  return (
    <View style={styles.row}>
      {bikeChipAnchorId !== undefined ? (
        <TutorialAnchor id={bikeChipAnchorId} style={styles.chipWrap}>
          {bikeChip}
        </TutorialAnchor>
      ) : (
        bikeChip
      )}
      <View style={styles.spacer} />
      <View style={styles.actions}>
        {trailing}
        <IconButton
          icon="reminder"
          onPress={onRemindersPress}
          accessibilityLabel={remindersA11yLabel}
          badge={reminderCount}
        />
      </View>
    </View>
  );
}
