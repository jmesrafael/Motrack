import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Icon, type IconName } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

interface MoreItem {
  icon: IconName;
  label: string;
  href: '/garage' | '/documents' | '/statistics' | '/reminders' | '/settings' | '/search';
}

const ITEMS: MoreItem[] = [
  { icon: 'garage', label: 'Garage', href: '/garage' },
  { icon: 'documents', label: 'Documents', href: '/documents' },
  { icon: 'statistics', label: 'Statistics', href: '/statistics' },
  { icon: 'reminder', label: 'Reminders', href: '/reminders' },
  { icon: 'settings', label: 'Search', href: '/search' },
  { icon: 'settings', label: 'Settings', href: '/settings' },
];

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    title: typeStyle(t.type.h1, t.text.primary),
    row: { flexDirection: 'row', alignItems: 'center', gap: t.space.s3 },
    label: typeStyle(t.type.body, t.text.primary),
  }),
);

/** S-30 More (tab root). */
export default function MoreRoute() {
  const styles = useStyles();
  const router = useRouter();
  const { tokens } = useTheme();

  return (
    <Screen>
      <Text style={styles.title}>More</Text>
      {ITEMS.map((item) => (
        <Card key={item.href} onPress={() => router.push(item.href)} accessibilityLabel={item.label}>
          <View style={styles.row}>
            <Icon name={item.icon} size={tokens.iconSize.listLeading} />
            <Text style={styles.label}>{item.label}</Text>
          </View>
        </Card>
      ))}
    </Screen>
  );
}
