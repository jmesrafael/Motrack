import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { glass, makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface FloatingBadge {
  icon: IconName;
  label: string;
}

export interface OnboardingIllustrationProps {
  icon: IconName;
  badges: [FloatingBadge, FloatingBadge];
  /** Drives the entrance + idle animation restart per stage. */
  animationKey: number;
}

const SIZE = 232;

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: {
      width: SIZE,
      height: SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
    },
    ring: {
      position: 'absolute',
      width: SIZE,
      height: SIZE,
      borderRadius: SIZE / 2,
      borderWidth: 1,
      borderColor: t.border.divider,
    },
    core: {
      width: SIZE - 56,
      height: SIZE - 56,
      borderRadius: (SIZE - 56) / 2,
      backgroundColor: t.primary.base,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      position: 'absolute',
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s1,
      borderRadius: t.radius.full,
      paddingHorizontal: t.space.s3,
      paddingVertical: t.space.s2,
      ...glass(t, true),
    },
    badgeLabel: typeStyle(t.type.captionStrong, t.text.primary, t.type.family),
  }),
);

/**
 * Icon-and-chip composition standing in for a hand illustration — animated,
 * lightweight (no image assets), and stage-specific via `icon`/`badges`.
 * A slow orbit + gentle float sells "interactive" without being distracting.
 */
export function OnboardingIllustration({ icon, badges, animationKey }: OnboardingIllustrationProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const reduceMotion = useReducedMotion();
  const [enter] = useState(() => new Animated.Value(0));
  const [float1] = useState(() => new Animated.Value(0));
  const [float2] = useState(() => new Animated.Value(0));
  const [spin] = useState(() => new Animated.Value(0));

  useEffect(() => {
    enter.setValue(0);
    Animated.spring(enter, {
      toValue: 1,
      damping: 14,
      stiffness: 140,
      useNativeDriver: true,
    }).start();

    if (reduceMotion) {
      return;
    }
    const loop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(float1, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(float1, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ]),
    );
    const loop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(float2, { toValue: 1, duration: 1900, useNativeDriver: true }),
        Animated.timing(float2, { toValue: 0, duration: 1900, useNativeDriver: true }),
      ]),
    );
    const spinLoop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 24000, useNativeDriver: true }),
    );
    loop1.start();
    loop2.start();
    spinLoop.start();
    return () => {
      loop1.stop();
      loop2.stop();
      spinLoop.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationKey, reduceMotion]);

  const floatY1 = float1.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const floatY2 = float2.interpolate({ inputRange: [0, 1], outputRange: [0, 7] });
  const ringSpin = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.ring, { transform: [{ rotate: ringSpin }] }]} />
      <Animated.View
        style={{
          transform: [
            { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
            { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
          ],
          opacity: enter,
        }}>
        <View style={styles.core}>
          <Icon name={icon} size={tokens.iconSize.hero} color={tokens.primary.on} />
        </View>
      </Animated.View>
      <Animated.View
        style={[
          styles.badge,
          { top: 6, left: -18, transform: [{ translateY: floatY1 }], opacity: enter },
        ]}>
        <Icon name={badges[0].icon} size={tokens.iconSize.inline} color={tokens.primary.text} />
        <Text style={styles.badgeLabel}>{badges[0].label}</Text>
      </Animated.View>
      <Animated.View
        style={[
          styles.badge,
          { bottom: 12, right: -22, transform: [{ translateY: floatY2 }], opacity: enter },
        ]}>
        <Icon name={badges[1].icon} size={tokens.iconSize.inline} color={tokens.feedback.success.base} />
        <Text style={styles.badgeLabel}>{badges[1].label}</Text>
      </Animated.View>
    </View>
  );
}
