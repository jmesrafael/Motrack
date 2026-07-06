import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Icon, type IconName } from '@/components/Icon';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface StatCardProps {
  label: string;
  value: string;
  caption?: string;
  icon?: IconName;
  onPress?: () => void;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s2,
    },
    label: typeStyle(t.type.caption, t.text.secondary),
    value: {
      ...typeStyle(t.type.h1, t.text.primary),
      fontVariant: ['tabular-nums'],
      marginTop: t.space.s1,
    },
    caption: {
      ...typeStyle(t.type.caption, t.text.tertiary),
      marginTop: 2,
    },
  }),
);

export function StatCard({ label, value, caption, icon, onPress }: StatCardProps) {
  const styles = useStyles();
  const { tokens } = useTheme();

  return (
    <Card
      {...(onPress !== undefined ? { onPress } : {})}
      accessibilityLabel={`${label}: ${value}${caption !== undefined ? `, ${caption}` : ''}`}>
      <View style={styles.header}>
        {icon !== undefined ? (
          <Icon name={icon} size={tokens.iconSize.inline} color={tokens.icon.secondary} />
        ) : null}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      {caption !== undefined ? <Text style={styles.caption}>{caption}</Text> : null}
    </Card>
  );
}
