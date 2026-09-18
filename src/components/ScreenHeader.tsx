import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { IconButton } from '@/components/IconButton';
import { makeStyles, typeStyle } from '@/theme/styles';

export interface ScreenHeaderProps {
  title: string;
  /** Defaults to router.back(). */
  onBack?: () => void;
  /** Trailing action slot (e.g. delete, edit). */
  trailing?: ReactNode;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s3,
      minHeight: t.size.buttonMd,
      marginBottom: t.space.s1,
    },
    title: {
      ...typeStyle(t.type.h1, t.text.primary, t.type.family),
      flex: 1,
    },
  }),
);

/** Back chevron + screen title, for stack screens (headers are disabled globally). */
export function ScreenHeader({ title, onBack, trailing }: ScreenHeaderProps) {
  const styles = useStyles();
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());

  return (
    <View style={styles.row}>
      <IconButton icon="arrowLeft" onPress={handleBack} accessibilityLabel="Go back" variant="ghost" />
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {trailing}
    </View>
  );
}
