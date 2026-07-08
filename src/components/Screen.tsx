import { useEffect, useRef, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { makeStyles } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';
import { registerScroll, unregisterScroll } from '@/tutorial/anchors';
import { TutorialScrollContext } from '@/tutorial/ui/scrollContext';

export interface ScreenProps {
  children: ReactNode;
  /** Scrolling content (default); false for fixed layouts like empty states. */
  scroll?: boolean;
  /**
   * Registers this screen's ScrollView with the tutorial engine so coach
   * marks can auto-scroll off-screen anchors into view. Inert otherwise.
   */
  tutorialScrollId?: string;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.bg.page,
    },
    // s5 section rhythm: enough air for sections to read as groups without
    // pushing "Next maintenance" below the fold on small screens.
    content: {
      paddingHorizontal: t.space.s4,
      paddingBottom: t.space.s8,
      gap: t.space.s5,
    },
    fixed: {
      flex: 1,
      paddingHorizontal: t.space.s4,
    },
  }),
);

export function Screen({ children, scroll = true, tutorialScrollId }: ScreenProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const topPadding = insets.top + tokens.space.s2;
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    if (tutorialScrollId === undefined || !scroll) {
      return;
    }
    registerScroll(tutorialScrollId, scrollRef);
    return () => unregisterScroll(tutorialScrollId, scrollRef);
  }, [tutorialScrollId, scroll]);

  if (!scroll) {
    return (
      <View style={styles.root}>
        <View style={[styles.fixed, { paddingTop: topPadding }]}>{children}</View>
      </View>
    );
  }

  const content = (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={[styles.content, { paddingTop: topPadding }]}
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );

  return (
    <View style={styles.root}>
      {tutorialScrollId !== undefined ? (
        <TutorialScrollContext.Provider value={tutorialScrollId}>
          {content}
        </TutorialScrollContext.Provider>
      ) : (
        content
      )}
    </View>
  );
}
