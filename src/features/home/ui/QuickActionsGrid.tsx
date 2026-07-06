import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { strings } from '@/i18n/strings';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface QuickActionsGridProps {
  onAction: () => void;
}

interface QuickAction {
  id: string;
  icon: IconName;
  label: string;
}

const ACTIONS: QuickAction[] = [
  { id: 'log-service', icon: 'maintenance', label: strings.dashboard.quickActions.logService },
  { id: 'add-fuel', icon: 'fuel', label: strings.dashboard.quickActions.addFuel },
  { id: 'add-expense', icon: 'expense', label: strings.dashboard.quickActions.addExpense },
  { id: 'update-odo', icon: 'odometer', label: strings.dashboard.quickActions.updateOdo },
];

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    section: {
      gap: t.space.s2,
    },
    title: {
      ...typeStyle(t.type.h2, t.text.primary),
      paddingHorizontal: t.space.s1,
    },
    grid: {
      flexDirection: 'row',
      gap: t.space.s3,
    },
    tile: {
      flex: 1,
      alignItems: 'center',
      gap: t.space.s2,
      backgroundColor: t.bg.card,
      borderRadius: t.radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border.divider,
      paddingVertical: t.space.s3,
      paddingHorizontal: t.space.s1,
      minHeight: 88,
      justifyContent: 'center',
    },
    iconWell: {
      width: 40,
      height: 40,
      borderRadius: t.radius.full,
      backgroundColor: t.primary.bg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      ...typeStyle(t.type.caption, t.text.secondary),
      textAlign: 'center',
    },
  }),
);

export function QuickActionsGrid({ onAction }: QuickActionsGridProps) {
  const styles = useStyles();
  const { tokens } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={styles.title} accessibilityRole="header">
        {strings.dashboard.quickActions.title}
      </Text>
      <View style={styles.grid}>
        {ACTIONS.map((action) => (
          <Pressable
            key={action.id}
            onPress={onAction}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            style={({ pressed }) => [styles.tile, pressed && { opacity: 0.7 }]}>
            <View style={styles.iconWell}>
              <Icon
                name={action.icon}
                size={tokens.iconSize.listLeading}
                color={tokens.primary.base}
              />
            </View>
            <Text style={styles.label}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
