import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import type { IconName } from '@/components/Icon';
import { useStrings } from '@/i18n/useStrings';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';
import { OnboardingIllustration, type FloatingBadge } from './OnboardingIllustration';

export interface OnboardingCarouselProps {
  onSkip: () => void;
  onFinish: () => void;
}

const STAGE_VISUALS: { icon: IconName; badges: [FloatingBadge, FloatingBadge] }[] = [
  {
    icon: 'motorcycle',
    badges: [
      { icon: 'bikeSetup', label: 'Street Twin' },
      { icon: 'odometer', label: '12,480 km' },
    ],
  },
  {
    icon: 'calendarClock',
    badges: [
      { icon: 'statusDueSoon', label: 'Chain · Due soon' },
      { icon: 'statusGood', label: 'Oil · OK' },
    ],
  },
  {
    icon: 'history',
    badges: [
      { icon: 'checkCircle', label: '4 services' },
      // No fabricated currency amount before the user has any data of their
      // own — a qualitative "this app watches spend" cue instead.
      { icon: 'trendingUp', label: 'Spending, tracked' },
    ],
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.bg.page },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: t.space.gutter,
      minHeight: t.size.buttonMd,
    },
    skipLabel: typeStyle(t.type.bodyStrong, t.text.secondary, t.type.family),
    slide: {
      width: SCREEN_WIDTH,
      paddingHorizontal: t.space.s6,
      alignItems: 'center',
      justifyContent: 'center',
      gap: t.space.s8,
    },
    eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: t.space.s2 },
    eyebrow: {
      ...typeStyle(t.type.label, t.primary.text, t.type.family),
      letterSpacing: 2,
    },
    textBlock: { gap: t.space.s3, alignItems: 'center' },
    title: { ...typeStyle(t.type.hero, t.text.primary, t.type.family), textAlign: 'center' },
    body: {
      ...typeStyle(t.type.body, t.text.secondary, t.type.family),
      textAlign: 'center',
      maxWidth: 320,
    },
    footer: {
      paddingHorizontal: t.space.gutter,
      gap: t.space.s5,
    },
    dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: t.space.s2 },
    dot: { height: 6, borderRadius: 3, backgroundColor: t.border.strong },
    dotActive: { backgroundColor: t.primary.base },
  }),
);

/**
 * Creative onboarding — 3 swipeable stages explaining the app's purpose, not
 * decorative art. Progress dots, Skip (top-right), swipe-or-tap Next, and a
 * final "Get started" CTA that hands off to motorcycle setup.
 */
export function OnboardingCarousel({ onSkip, onFinish }: OnboardingCarouselProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const strings = useStrings();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView | null>(null);
  const [index, setIndex] = useState(0);
  const [dotWidths] = useState(() => STAGE_VISUALS.map(() => new Animated.Value(6)));

  const stages = strings.onboarding.carousel.stages;
  const isLast = index === stages.length - 1;

  const goTo = (next: number) => {
    scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
    setIndex(next);
  };

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setIndex(next);
  };

  const handleNext = () => {
    if (isLast) {
      onFinish();
      return;
    }
    goTo(index + 1);
  };

  useEffect(() => {
    dotWidths.forEach((value, i) => {
      Animated.timing(value, {
        toValue: i === index ? 22 : 6,
        duration: tokens.motion.base.durationMs,
        useNativeDriver: false,
      }).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <View style={styles.root}>
      <View style={[styles.topRow, { marginTop: insets.top }]}>
        <Pressable
          onPress={onSkip}
          accessibilityRole="button"
          accessibilityLabel={strings.onboarding.carousel.skip}
          hitSlop={12}>
          <Text style={styles.skipLabel}>{strings.onboarding.carousel.skip}</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        style={{ flex: 1 }}>
        {stages.map((stage, i) => (
          <View key={stage.title} style={styles.slide}>
            <OnboardingIllustration
              icon={STAGE_VISUALS[i]?.icon ?? 'motorcycle'}
              badges={STAGE_VISUALS[i]?.badges ?? STAGE_VISUALS[0]!.badges}
              animationKey={index === i ? i : -1}
            />
            <View style={styles.textBlock}>
              <View style={styles.eyebrowRow}>
                <Text style={styles.eyebrow}>{stage.eyebrow}</Text>
              </View>
              <Text style={styles.title}>{stage.title}</Text>
              <Text style={styles.body}>{stage.body}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + tokens.space.s5 }]}>
        <View style={styles.dotsRow}>
          {stages.map((stage, i) => (
            <Animated.View
              key={stage.title}
              style={[styles.dot, i === index && styles.dotActive, { width: dotWidths[i]! }]}
            />
          ))}
        </View>
        <Button
          label={isLast ? strings.onboarding.carousel.getStarted : strings.onboarding.carousel.next}
          onPress={handleNext}
          variant="primary"
          size="lg"
        />
      </View>
    </View>
  );
}
