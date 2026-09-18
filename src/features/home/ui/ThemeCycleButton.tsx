import { useState } from 'react';
import { Animated, StyleSheet } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { interpolate, strings } from '@/i18n/strings';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { makeStyles } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

/**
 * Dashboard quick switcher: system → light → dark. The shipped picker lives
 * in Settings and lists the registry (THEME_GUIDE.md §5). A quarter-turn spin
 * on press sells the mode change alongside the app-wide cross-dissolve.
 */
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
  const [rotation] = useState(() => new Animated.Value(0));

  const modeLabel =
    preference === 'system'
      ? strings.themeSwitcher.system
      : preference === 'light'
        ? strings.themeSwitcher.light
        : strings.themeSwitcher.dark;

  const handlePress = () => {
    rotation.setValue(0);
    Animated.timing(rotation, {
      toValue: 1,
      duration: tokens.motion.base.durationMs,
      useNativeDriver: true,
    }).start();
    cycle();
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
