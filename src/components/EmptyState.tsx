import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface EmptyStateProps {
  icon: IconName;
  title: string;
  body: string;
  /** Renders a primary CTA directly below the body copy when both are given. */
  ctaLabel?: string;
  onCtaPress?: () => void;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: t.space.s3,
      padding: t.space.s6,
    },
    iconWell: {
      width: 84,
      height: 84,
      borderRadius: t.radius.xl,
      backgroundColor: t.bg.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: t.space.s2,
    },
    title: {
      ...typeStyle(t.type.h2, t.text.primary, t.type.family),
      textAlign: 'center',
    },
    body: {
      ...typeStyle(t.type.body, t.text.secondary, t.type.family),
      textAlign: 'center',
      maxWidth: 280,
    },
    // Same centered container as title/body (maxWidth, centered by root's
    // alignItems) instead of alignSelf:'stretch', which ignored that centering
    // and pinned the button to root's full, unconstrained edge-to-edge width.
    cta: {
      marginTop: t.space.s2,
      alignSelf: 'center',
      width: '100%',
      maxWidth: 320,
    },
  }),
);

/** Empty states get a soft breathing icon well, not a static wall of gray — cheap, non-distracting. */
export function EmptyState({ icon, title, body, ctaLabel, onCtaPress }: EmptyStateProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const reduceMotion = useReducedMotion();
  const [scale] = useState(() => new Animated.Value(0.9));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: reduceMotion ? 0 : 260, useNativeDriver: true }),
      Animated.spring(scale, {
        toValue: 1,
        damping: 14,
        stiffness: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale, reduceMotion]);

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.iconWell, { opacity, transform: [{ scale }] }]}>
        <Icon name={icon} size={tokens.iconSize.feature} color={tokens.primary.text} />
      </Animated.View>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.body}>{body}</Text>
      {ctaLabel !== undefined && onCtaPress !== undefined ? (
        <View style={styles.cta}>
          <PrimaryButton label={ctaLabel} onPress={onCtaPress} />
        </View>
      ) : null}
    </View>
  );
}
