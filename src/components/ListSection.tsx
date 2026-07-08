import { Children, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { SectionHeader } from '@/components/SectionHeader';
import { makeStyles } from '@/theme/styles';

export interface ListSectionProps {
  title: string;
  /** Trailing "See all"-style action on the section header. */
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    section: {
      gap: t.space.s2,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: t.border.divider,
      marginLeft: t.space.s4,
    },
  }),
);

/** Grouped list block: section header + one card of rows with hairline dividers. */
export function ListSection({ title, actionLabel, onAction, children }: ListSectionProps) {
  const styles = useStyles();
  const items = Children.toArray(children);

  return (
    <View style={styles.section}>
      <SectionHeader
        title={title}
        {...(actionLabel !== undefined ? { actionLabel } : {})}
        {...(onAction !== undefined ? { onAction } : {})}
      />
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
