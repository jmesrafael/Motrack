import { Pressable, StyleSheet, Text } from 'react-native';

import { Icon } from '@/components/Icon';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface DocumentWarningBannerProps {
  message: string;
  onPress: () => void;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s3,
      backgroundColor: t.feedback.warning.bg,
      borderRadius: t.radius.md,
      paddingHorizontal: t.space.s4,
      paddingVertical: t.space.s3,
      minHeight: 44,
    },
    message: {
      ...typeStyle(t.type.bodyStrong, t.text.primary),
      flex: 1,
    },
  }),
);

export function DocumentWarningBanner({ message, onPress }: DocumentWarningBannerProps) {
  const styles = useStyles();
  const { tokens } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={message}
      style={({ pressed }) => [styles.banner, pressed && { opacity: 0.7 }]}>
      <Icon name="documents" size={tokens.iconSize.listLeading} color={tokens.notif.warning} />
      <Text style={styles.message}>{message}</Text>
      <Icon name="chevronRight" size={tokens.iconSize.inline} color={tokens.icon.secondary} />
    </Pressable>
  );
}
