import { StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface EmptyStateProps {
  icon: IconName;
  title: string;
  body: string;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: t.space.s3,
      padding: t.space.s6,
    },
    iconWell: {
      width: 72,
      height: 72,
      borderRadius: t.radius.full,
      backgroundColor: t.bg.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: t.space.s2,
    },
    title: {
      ...typeStyle(t.type.h2, t.text.primary),
      textAlign: 'center',
    },
    body: {
      ...typeStyle(t.type.body, t.text.secondary),
      textAlign: 'center',
      maxWidth: 280,
    },
  }),
);

export function EmptyState({ icon, title, body }: EmptyStateProps) {
  const styles = useStyles();
  const { tokens } = useTheme();

  return (
    <View style={styles.root}>
      <View style={styles.iconWell}>
        <Icon name={icon} size={tokens.iconSize.feature} color={tokens.icon.secondary} />
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}
