import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Icon, type IconName } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { useActiveBike } from '@/hooks/useActiveBike';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

interface LogOption {
  icon: IconName;
  label: string;
  href: '/maintenance/log' | '/fuel/log' | '/expense/log' | '/repair/log' | '/odometer';
}

const OPTIONS: LogOption[] = [
  { icon: 'maintenance', label: 'Log maintenance', href: '/maintenance/log' },
  { icon: 'fuel', label: 'Log fuel', href: '/fuel/log' },
  { icon: 'expense', label: 'Add expense', href: '/expense/log' },
  { icon: 'repair', label: 'Log repair', href: '/repair/log' },
  { icon: 'odometer', label: 'Update odometer', href: '/odometer' },
];

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    title: typeStyle(t.type.h1, t.text.primary),
    row: { flexDirection: 'row', alignItems: 'center', gap: t.space.s3 },
    iconWell: {
      width: 44,
      height: 44,
      borderRadius: t.radius.full,
      backgroundColor: t.primary.bg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: typeStyle(t.type.bodyStrong, t.text.primary),
  }),
);

/** Log launcher (center tab) — routes to each logging form (SCREEN_SPECIFICATIONS.md §0). */
export default function LogRoute() {
  const styles = useStyles();
  const router = useRouter();
  const { tokens } = useTheme();
  const { activeBike } = useActiveBike();

  return (
    <Screen>
      <Text style={styles.title}>Log</Text>
      {OPTIONS.map((option) => (
        <Card
          key={option.href}
          onPress={() => {
            if (activeBike !== null) {
              router.push(option.href);
            }
          }}
          accessibilityLabel={option.label}>
          <View style={styles.row}>
            <View style={styles.iconWell}>
              <Icon name={option.icon} size={tokens.iconSize.md} color={tokens.primary.base} />
            </View>
            <Text style={styles.label}>{option.label}</Text>
          </View>
        </Card>
      ))}
    </Screen>
  );
}
