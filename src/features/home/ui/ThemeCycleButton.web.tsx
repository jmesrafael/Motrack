import { useState } from 'react';
import { flushSync } from 'react-dom';
import { Animated, StyleSheet, type GestureResponderEvent } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { interpolate, strings } from '@/i18n/strings';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { makeStyles } from '@/theme/styles';
import { skipNextThemeFade } from '@/theme/themeTransition';
import { useTheme } from '@/theme/useTheme';

/**
 * Web build of the dashboard theme switcher: same button, but the mode
 * change sweeps in as a circle growing from the button using the browser's
 * View Transitions API (RN Web renders to a real DOM, so this works as-is —
 * see D:\NEW_SITES\sawo-helpdesk-ai's ThemeToggle for the same technique).
 * No native equivalent of startViewTransition exists, so native keeps the
 * plain spin from ThemeCycleButton.tsx.
 */
const REVEAL_MS = 600;
const REVEAL_EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';

const PREFERENCE_ICONS: Partial<Record<string, IconName>> = {
  system: 'themeSystem',
  light: 'themeLight',
  dark: 'themeDark',
};

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    button: {
      width: t.size.iconWell,
      height: t.size.iconWell,
      borderRadius: t.radius.full,
      backgroundColor: t.bg.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);

export function ThemeCycleButton() {
  const styles = useStyles();
  const { tokens, preference } = useTheme();
  const cycle = useSettingsStore((s) => s.cycleThemePreference);
  const reduceMotion = useReducedMotion();
  const [rotation] = useState(() => new Animated.Value(0));

  const modeLabel =
    preference === 'system'
      ? strings.themeSwitcher.system
      : preference === 'light'
        ? strings.themeSwitcher.light
        : strings.themeSwitcher.dark;

  const spinButton = () => {
    rotation.setValue(0);
    Animated.timing(rotation, {
      toValue: 1,
      duration: tokens.motion.base.durationMs,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = (e: GestureResponderEvent) => {
    spinButton();

    if (document.startViewTransition === undefined || reduceMotion) {
      cycle();
      return;
    }

    // Grows from where the finger/cursor actually is, not the button's
    // center — RN Web's press event carries real page coordinates.
    const x = e.nativeEvent.pageX;
    const y = e.nativeEvent.pageY;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    skipNextThemeFade();
    const transition = document.startViewTransition(() => {
      flushSync(() => cycle());
    });

    void transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: REVEAL_MS, easing: REVEAL_EASE, pseudoElement: '::view-transition-new(root)' },
      );
    });
  };

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <PressableScale
      onPress={handlePress}
      scaleTo={0.92}
      accessibilityRole="button"
      accessibilityLabel={interpolate(strings.themeSwitcher.a11y, { mode: modeLabel })}
      style={styles.button}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Icon name={PREFERENCE_ICONS[preference] ?? 'themeSystem'} size={tokens.iconSize.md} />
      </Animated.View>
    </PressableScale>
  );
}
