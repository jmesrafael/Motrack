import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/Icon';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

/** 5 tabs with the raised center Log action (SCREEN_SPECIFICATIONS.md §0). */
const TAB_ICONS: Record<string, { active: IconName; idle: IconName }> = {
  index: { active: 'homeActive', idle: 'homeIdle' },
  maintenance: { active: 'maintenance', idle: 'maintenanceIdle' },
  money: { active: 'moneyActive', idle: 'moneyIdle' },
  more: { active: 'more', idle: 'more' },
};

const CENTER_ROUTE = 'log';

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      backgroundColor: t.bg.nav,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.border.divider,
    },
    item: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingTop: t.space.s2,
      paddingBottom: t.space.s1,
      gap: t.space.s1,
      minHeight: 56,
    },
    label: typeStyle(t.type.label, t.icon.secondary),
    labelActive: typeStyle(t.type.label, t.primary.base),
    centerButton: {
      width: 56,
      height: 56,
      borderRadius: t.radius.full,
      backgroundColor: t.primary.base,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -t.space.s6,
      ...(t.elevation.sheet ?? {}),
    },
    centerButtonPressed: {
      backgroundColor: t.primary.pressed,
    },
  }),
);

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const descriptor = descriptors[route.key];
        const label = descriptor?.options.title ?? route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (route.name === CENTER_ROUTE) {
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityLabel={label}
              style={styles.item}>
              {({ pressed }) => (
                <>
                  <View style={[styles.centerButton, pressed && styles.centerButtonPressed]}>
                    <Icon name="plus" size={tokens.iconSize.feature} color={tokens.primary.on} />
                  </View>
                  <Text style={styles.label}>{label}</Text>
                </>
              )}
            </Pressable>
          );
        }

        const icons = TAB_ICONS[route.name];
        const iconName = icons === undefined ? 'more' : isFocused ? icons.active : icons.idle;

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={label}
            style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}>
            <Icon
              name={iconName}
              size={tokens.iconSize.md}
              color={isFocused ? tokens.primary.base : tokens.icon.secondary}
            />
            <Text style={isFocused ? styles.labelActive : styles.label}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
