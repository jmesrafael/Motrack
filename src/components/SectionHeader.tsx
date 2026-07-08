import { Pressable, StyleSheet, Text, View } from 'react-native';

import { makeStyles, typeStyle } from '@/theme/styles';

export interface SectionHeaderProps {
  title: string;
  /** Quiet trailing context (e.g. the month name). Ignored when an action is set. */
  trailingLabel?: string;
  /** Trailing text action ("See all") — rendered as a link-colored button. */
  actionLabel?: string;
  onAction?: () => void;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: t.space.s3,
      paddingHorizontal: t.space.s1,
    },
    title: {
      ...typeStyle(t.type.h2, t.text.primary),
      flexShrink: 1,
    },
    trailingLabel: typeStyle(t.type.caption, t.text.tertiary),
    action: typeStyle(t.type.bodyStrong, t.primary.base),
  }),
);

/** The one section-header treatment every dashboard section shares. */
export function SectionHeader({ title, trailingLabel, actionLabel, onAction }: SectionHeaderProps) {
  const styles = useStyles();

  return (
    <View style={styles.row}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {actionLabel !== undefined && onAction !== undefined ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel}, ${title}`}
          hitSlop={12}
          style={({ pressed }) => pressed && { opacity: 0.7 }}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : trailingLabel !== undefined ? (
        <Text style={styles.trailingLabel}>{trailingLabel}</Text>
      ) : null}
    </View>
  );
}
