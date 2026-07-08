import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { SectionHeader } from '@/components/SectionHeader';
import { strings } from '@/i18n/strings';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface QuickActionsGridProps {
  onAction: (actionId: 'log-service' | 'add-fuel' | 'add-expense' | 'update-odo') => void;
}

interface QuickAction {
  id: 'log-service' | 'add-fuel' | 'add-expense' | 'update-odo';
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
    tilePressed: {
      transform: [{ scale: 0.97 }],
    },
    iconWell: {
      width: 40,
      height: 40,
      borderRadius: t.radius.full,
      backgroundColor: t.primary.bg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Labels are the tap targets' names — primary ink for outdoor legibility.
    label: {
      ...typeStyle(t.type.caption, t.text.primary),
      textAlign: 'center',
    },
  }),
);

export function QuickActionsGrid({ onAction }: QuickActionsGridProps) {
  const styles = useStyles();
  const { tokens } = useTheme();

  return (
    <View style={styles.section}>
      <SectionHeader title={strings.dashboard.quickActions.title} />
      <View style={styles.grid}>
        {ACTIONS.map((action) => (
          <Pressable
            key={action.id}
            onPress={() => onAction(action.id)}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}>
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
