import { Children, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { makeStyles, typeStyle } from '@/theme/styles';

export interface ListSectionProps {
  title: string;
  /** Right-aligned action label (e.g. "See all"). */
  action?: { label: string; onPress: () => void };
  children: ReactNode;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    section: {
      gap: t.space.s2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: t.space.s1,
    },
    title: typeStyle(t.type.h2, t.text.primary, t.type.family),
    action: typeStyle(t.type.captionStrong, t.primary.text, t.type.family),
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: t.border.divider,
      marginLeft: t.space.s4,
    },
  }),
);

/** Grouped list block: section header + one card of rows with hairline dividers. */
export function ListSection({ title, action, children }: ListSectionProps) {
  const styles = useStyles();
  const items = Children.toArray(children);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {action !== undefined ? (
          <Text style={styles.action} onPress={action.onPress} accessibilityRole="button">
            {action.label}
          </Text>
        ) : null}
      </View>
      <Card flush>
        {items.map((child, index) => (
          <View key={index}>
            {index > 0 ? <View style={styles.divider} /> : null}
            {child}
          </View>
        ))}
      </Card>
    </View>
  );
}
