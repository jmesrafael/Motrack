import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTabBarStore } from '@/stores/useTabBarStore';
import { makeStyles } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';
import { registerScroll, unregisterScroll } from '@/tutorial/anchors';
import { TutorialScrollContext } from '@/tutorial/ui/scrollContext';

/** How close to the end (px) counts as "reached the bottom" for the tab bar. */
const TAB_BAR_BOTTOM_THRESHOLD = 24;

/**
 * Space reserved above the device's bottom safe-area inset for the floating
 * TabBar: its own gap off-screen-bottom (10) + its height (t.size.navHeight,
 * 64) + breathing room (16) so the last row of content never rides flush
 * against the pill. Mirrors TabBar.tsx's own `bottom: insets.bottom + 10`.
 */
const TAB_BAR_CLEARANCE = 90;

export interface ScreenProps {
  children: ReactNode;
  /** Scrolling content (default); false for fixed layouts like empty states. */
  scroll?: boolean;
  /**
   * Registers this screen's ScrollView with the tutorial engine so coach
   * marks can auto-scroll off-screen anchors into view. Inert otherwise.
   */
  tutorialScrollId?: string;
  /** Reserves space at the bottom for the floating tab bar. Only the 5 tab-root screens need this. */
  withTabBarInset?: boolean;
  /** Skip the enter fade — used by screens that manage their own entrance. */
  noAnimation?: boolean;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.bg.page,
    },
    content: {
      paddingHorizontal: t.space.gutter,
    },
    stack: {
      gap: t.space.s4,
    },
    fixed: {
      flex: 1,
      paddingHorizontal: t.space.gutter,
      gap: t.space.s4,
    },
  }),
);

/** Subtle fade+rise on screen mount — the one "page transition" every screen gets for free. */
function useEnterAnimation(disabled: boolean) {
  const reduceMotion = useReducedMotion();
  const [opacity] = useState(() => new Animated.Value(disabled || reduceMotion ? 1 : 0));
  const [y] = useState(() => new Animated.Value(disabled || reduceMotion ? 0 : 10));

  useEffect(() => {
    if (disabled || reduceMotion) {
      return;
    }
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { opacity, transform: [{ translateY: y }] };
}

export function Screen({
  children,
  scroll = true,
  tutorialScrollId,
  withTabBarInset = false,
  noAnimation = false,
}: ScreenProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView | null>(null);
  const enter = useEnterAnimation(noAnimation);
  // Additive, not a flat replacement: every screen keeps its base bottom
  // spacing AND the device's real bottom safe-area inset. The previous flat
  // `withTabBarInset ? 100 : 0` ignored insets.bottom entirely, so on any
  // screen without a tab bar the last content row had zero bottom protection,
  // and even tab-root screens under-reserved space on devices with a tall
  // home-indicator inset.
  const bottomPad =
    insets.bottom + (withTabBarInset ? TAB_BAR_CLEARANCE : scroll ? tokens.space.s6 : tokens.space.s4);
  const setTabBarHidden = useTabBarStore((s) => s.setHidden);

  useEffect(() => {
    if (tutorialScrollId === undefined || !scroll) {
      return;
    }
    registerScroll(tutorialScrollId, scrollRef);
    return () => unregisterScroll(tutorialScrollId, scrollRef);
  }, [tutorialScrollId, scroll]);

  // Tab bar starts visible on every fresh tab-root screen (top of the page).
  useEffect(() => {
    if (withTabBarInset) {
      setTabBarHidden(false);
    }
  }, [withTabBarInset, setTabBarHidden]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!withTabBarInset) {
      return;
    }
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollable = contentSize.height > layoutMeasurement.height + TAB_BAR_BOTTOM_THRESHOLD;
    const atEnd =
      scrollable &&
      contentOffset.y + layoutMeasurement.height >= contentSize.height - TAB_BAR_BOTTOM_THRESHOLD;
    setTabBarHidden(atEnd);
  };

  if (!scroll) {
    return (
      <View style={styles.root}>
        <Animated.View style={[styles.fixed, { paddingTop: insets.top, paddingBottom: bottomPad }, enter]}>
          {children}
        </Animated.View>
      </View>
    );
  }

  const content = (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 8, paddingBottom: bottomPad },
      ]}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.stack, enter]}>{children}</Animated.View>
    </ScrollView>
  );

  return (
    <View style={styles.root}>
      {tutorialScrollId !== undefined ? (
        <TutorialScrollContext.Provider value={tutorialScrollId}>{content}</TutorialScrollContext.Provider>
      ) : (
        content
      )}
    </View>
  );
}
