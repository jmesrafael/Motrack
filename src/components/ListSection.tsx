import { Children, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { makeStyles, typeStyle } from '@/theme/styles';

export interface ListSectionProps {
  title: string;
  children: ReactNode;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    section: {
      gap: t.space.s2,
    },
    title: {
      ...typeStyle(t.type.h2, t.text.primary),
      paddingHorizontal: t.space.s1,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: t.border.divider,
      marginLeft: t.space.s4,
    },
  }),
);

/** Grouped list block: section header + one card of rows with hairline dividers. */
export function ListSection({ title, children }: ListSectionProps) {
  const styles = useStyles();
  const items = Children.toArray(children);

  return (
    <View style={styles.section}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
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
