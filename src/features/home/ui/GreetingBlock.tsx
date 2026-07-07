import { StyleSheet, Text, View } from 'react-native';

import { makeStyles, typeStyle } from '@/theme/styles';

export interface GreetingBlockProps {
  greeting: string;
  dateLabel: string;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    block: {
      gap: 2,
      paddingHorizontal: t.space.s1,
    },
    title: typeStyle(t.type.h1, t.text.primary),
    date: typeStyle(t.type.caption, t.text.tertiary),
  }),
);

export function GreetingBlock({ greeting, dateLabel }: GreetingBlockProps) {
  const styles = useStyles();
  return (
    <View style={styles.block}>
      <Text style={styles.title} accessibilityRole="header">
        {greeting}
      </Text>
      <Text style={styles.date}>{dateLabel}</Text>
    </View>
  );
}
