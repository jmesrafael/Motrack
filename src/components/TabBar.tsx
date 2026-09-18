import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTabBarStore } from '@/stores/useTabBarStore';
import { glass, makeStyles, shadow } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';
import { TutorialAnchor } from '@/tutorial/ui/TutorialAnchor';

/**
 * Floating pill navigation — 4 destinations plus a raised center Log action.
 * Absolutely positioned so screen content owns the full height; each tab-root
 * Screen adds `withTabBarInset` so its last item never sits behind the bar.
 * Persistent motorcycle context lives one level up (AppHeader's bike chip),
 * not duplicated here — this bar is purely "where am I / what can I log".
 */
const TAB_ICONS: Record<string, { active: IconName; idle: IconName }> = {
  index: { active: 'homeActive', idle: 'homeIdle' },
  maintenance: { active: 'maintenance', idle: 'maintenanceIdle' },
  money: { active: 'moneyActive', idle: 'moneyIdle' },
  more: { active: 'more', idle: 'more' },
};

const CENTER_ROUTE = 'log';

/** How far the center action rides above the bar's vertical center. */
const CENTER_LIFT = 16;

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    wrap: {
      position: 'absolute',
      left: t.space.s4,
      right: t.space.s4,
      alignItems: 'center',
    },
    bar: {
      flexDirection: 'row',
      width: '100%',
      maxWidth: 420,
      height: t.size.navHeight,
      borderRadius: t.radius.full,
      ...glass(t, true),
      ...shadow(t.elevation.sheet),
    },
    tabWrap: {
      flex: 1,
    },
    /** Outer press target: fills the bar's full height so `item` can center in it. */
    itemPress: {
      flex: 1,
    },
    item: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerSlot: {
      width: t.size.fab + 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    /**
     * The lift is a transform on the press target, not a margin: margins feed
     * back into the slot's centering (a negative one shifts the button by only
     * half of it), while a transform leaves it exactly centered in the slot.
     */
    centerPress: {
      transform: [{ translateY: -CENTER_LIFT }],
    },
    centerButton: {
      width: t.size.fab,
      height: t.size.fab,
      borderRadius: t.radius.full,
      backgroundColor: t.primary.base,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadow(t.elevation.accent),
    },
  }),
);

/** Slide + fade distance/duration for the scroll-to-hide behavior. */
const HIDE_TRAVEL = 32;

function useHideOnScroll(hidden: boolean) {
  const reduceMotion = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: hidden ? 1 : 0,
      duration: reduceMotion ? 0 : 220,
      useNativeDriver: true,
    }).start();
  }, [hidden, progress, reduceMotion]);

  return {
    opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
    transform: [
      { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, HIDE_TRAVEL] }) },
    ],
  };
}

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const hidden = useTabBarStore((s) => s.hidden);
  const hideStyle = useHideOnScroll(hidden);

  return (
    <View
      style={[styles.wrap, { bottom: insets.bottom + 10 }]}
      pointerEvents={hidden ? 'none' : 'box-none'}>
      <Animated.View style={[styles.bar, hideStyle]}>
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          const label = descriptor?.options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (route.name === CENTER_ROUTE) {
            return (
              <TutorialAnchor key={route.key} id={`tab.${route.name}`} style={styles.centerSlot}>
                <PressableScale
                  onPress={onPress}
                  scaleTo={0.9}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  containerStyle={styles.centerPress}
                  style={styles.centerButton}>
                  <Icon name="plus" size={tokens.iconSize.feature} color={tokens.primary.on} />
                </PressableScale>
              </TutorialAnchor>
            );
          }

          const icons = TAB_ICONS[route.name];
          const iconName = icons === undefined ? 'more' : isFocused ? icons.active : icons.idle;

          return (
            <TutorialAnchor key={route.key} id={`tab.${route.name}`} style={styles.tabWrap}>
              <PressableScale
                onPress={onPress}
                scaleTo={0.94}
                accessibilityRole="tab"
                accessibilityState={{ selected: isFocused }}
                accessibilityLabel={label}
                containerStyle={styles.itemPress}
                style={styles.item}>
                <Icon
                  name={iconName}
                  size={tokens.iconSize.md}
                  color={isFocused ? tokens.primary.text : tokens.icon.secondary}
                />
              </PressableScale>
            </TutorialAnchor>
          );
        })}
      </Animated.View>
    </View>
  );
}
