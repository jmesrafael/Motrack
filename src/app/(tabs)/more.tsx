import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { ListSection } from '@/components/ListSection';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

interface MoreItem {
  icon: IconName;
  label: string;
  href: '/garage' | '/documents' | '/statistics' | '/reminders' | '/settings';
}

const GARAGE_ITEMS: MoreItem[] = [
  { icon: 'garage', label: 'Garage', href: '/garage' },
  { icon: 'documents', label: 'Documents', href: '/documents' },
  { icon: 'statistics', label: 'Statistics', href: '/statistics' },
  { icon: 'reminder', label: 'Reminders', href: '/reminders' },
];

const APP_ITEMS: MoreItem[] = [{ icon: 'settings', label: 'Settings', href: '/settings' }];

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: typeStyle(t.type.h1, t.text.primary),
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s3,
      minHeight: t.size.row,
      paddingHorizontal: t.space.s4,
      paddingVertical: t.space.s2,
    },
    iconWell: {
      width: t.size.iconWellSm,
      height: t.size.iconWellSm,
      borderRadius: t.radius.md,
      backgroundColor: t.bg.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: { ...typeStyle(t.type.body, t.text.primary), flex: 1 },
  }),
);

function MoreRow({ item }: { item: MoreItem }) {
  const styles = useStyles();
  const router = useRouter();
  const { tokens } = useTheme();
  return (
    <PressableScale
      style={styles.row}
      onPress={() => router.push(item.href)}
      accessibilityRole="button"
      accessibilityLabel={item.label}>
      <View style={styles.iconWell}>
        <Icon name={item.icon} size={tokens.iconSize.listLeading} color={tokens.icon.primary} />
      </View>
      <Text style={styles.label}>{item.label}</Text>
      <Icon name="chevronRight" size={tokens.iconSize.inline} color={tokens.icon.secondary} />
    </PressableScale>
  );
}

/** S-30 More (tab root) — everything that isn't a daily tab, grouped by purpose. */
export default function MoreRoute() {
  const styles = useStyles();
  const router = useRouter();

  return (
    <Screen withTabBarInset>
      <View style={styles.header}>
        <Text style={styles.title}>More</Text>
        <IconButton icon="search" onPress={() => router.push('/search')} accessibilityLabel="Search" />
      </View>
      <ListSection title="Your garage">
        {GARAGE_ITEMS.map((item) => (
          <MoreRow key={item.href} item={item} />
        ))}
      </ListSection>
      <ListSection title="App">
        {APP_ITEMS.map((item) => (
          <MoreRow key={item.href} item={item} />
        ))}
      </ListSection>
    </Screen>
  );
}
