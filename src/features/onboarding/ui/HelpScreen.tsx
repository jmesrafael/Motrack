import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DestructiveButton } from '@/components/DestructiveButton';
import { Icon } from '@/components/Icon';
import { ListSection } from '@/components/ListSection';
import { Screen } from '@/components/Screen';
import { Toggle } from '@/components/Toggle';
import { interpolate, strings } from '@/i18n/strings';
import { useTutorialStore } from '@/stores/useTutorialStore';
import { startTutorial } from '@/tutorial/engine';
import { listTours } from '@/tutorial/registry';
import type { TutorialStatus } from '@/tutorial/progress';
import { ResumeDialog } from '@/tutorial/ui/TutorialDialogs';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

/**
 * Settings → Help & Tutorials: replay any tour, resume an abandoned one,
 * toggle Tutorial Mode (re-enables tips; user data untouched), and reset
 * tutorial progress only.
 */

const STATUS_LABEL: Record<TutorialStatus, string> = {
  completed: strings.help.status.completed,
  in_progress: strings.help.status.inProgress,
  skipped: strings.help.status.skipped,
  not_started: strings.help.status.notStarted,
};

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    title: typeStyle(t.type.h1, t.text.primary),
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s3,
      minHeight: 56,
      paddingHorizontal: t.space.s4,
      paddingVertical: t.space.s2,
    },
    rowBody: { flex: 1, gap: 2 },
    rowLabel: typeStyle(t.type.body, t.text.primary),
    rowStatus: typeStyle(t.type.caption, t.text.secondary),
    caption: {
      ...typeStyle(t.type.caption, t.text.secondary),
      paddingHorizontal: t.space.s1,
    },
  }),
);

export function HelpScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { tokens } = useTheme();
  const tutorials = useTutorialStore((s) => s.progress.tutorials);
  const tutorialMode = useTutorialStore((s) => s.progress.tutorialMode);
  const tourOffer = useTutorialStore((s) => s.progress.tourOffer);
  const setTutorialMode = useTutorialStore((s) => s.setTutorialMode);
  const setTourOffer = useTutorialStore((s) => s.setTourOffer);
  const resetAllProgress = useTutorialStore((s) => s.resetAllProgress);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resumeTourId, setResumeTourId] = useState<string | null>(null);

  const launch = (id: string, resumeFrom?: number) => {
    const config = listTours().find((t) => t.id === id);
    if (config === undefined) {
      return;
    }
    // Start first (the engine waits for the entry route), then navigate.
    startTutorial(id, resumeFrom !== undefined ? { resumeFrom, replay: true } : { replay: true });
    router.navigate(config.entryRoute as never);
  };

  const onTourPress = (id: string) => {
    const record = tutorials[id];
    if (record?.status === 'in_progress' && record.stepIndex > 0) {
      setResumeTourId(id);
      return;
    }
    launch(id);
  };

  return (
    <Screen>
      <Text style={styles.title}>{strings.help.title}</Text>
      <ListSection title={strings.help.toursSection}>
        {listTours().map((config) => {
          const status: TutorialStatus = tutorials[config.id]?.status ?? 'not_started';
          return (
            <Pressable
              key={config.id}
              onPress={() => onTourPress(config.id)}
              accessibilityRole="button"
              accessibilityLabel={interpolate(strings.help.replayA11y, { title: config.title })}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
              <Icon name="replay" size={tokens.iconSize.listLeading} />
              <View style={styles.rowBody}>
                <Text style={styles.rowLabel}>{config.title}</Text>
                <Text style={styles.rowStatus}>{STATUS_LABEL[status]}</Text>
              </View>
              <Icon name="chevronRight" size={tokens.iconSize.inline} color={tokens.icon.secondary} />
            </Pressable>
          );
        })}
      </ListSection>
      <ListSection title={strings.help.optionsSection}>
        <Toggle
          label={strings.help.tutorialMode}
          value={tutorialMode}
          onChange={setTutorialMode}
        />
        {tourOffer !== 'unseen' ? (
          <Pressable
            onPress={() => setTourOffer('unseen')}
            accessibilityRole="button"
            accessibilityLabel={strings.help.showOfferAgain}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
            <Icon name="help" size={tokens.iconSize.listLeading} />
            <View style={styles.rowBody}>
              <Text style={styles.rowLabel}>{strings.help.showOfferAgain}</Text>
            </View>
          </Pressable>
        ) : null}
      </ListSection>
      <Text style={styles.caption}>{strings.help.tutorialModeCaption}</Text>
      <DestructiveButton
        label={strings.help.resetProgress}
        onPress={() => setConfirmingReset(true)}
      />
      <ConfirmDialog
        visible={confirmingReset}
        title={strings.help.resetTitle}
        body={strings.help.resetBody}
        confirmLabel={strings.help.resetConfirm}
        onConfirm={() => {
          setConfirmingReset(false);
          resetAllProgress();
        }}
        onCancel={() => setConfirmingReset(false)}
      />
      <ResumeDialog
        visible={resumeTourId !== null}
        onResume={() => {
          const id = resumeTourId;
          setResumeTourId(null);
          if (id !== null) {
            launch(id, tutorials[id]?.stepIndex ?? 0);
          }
        }}
        onRestart={() => {
          const id = resumeTourId;
          setResumeTourId(null);
          if (id !== null) {
            launch(id);
          }
        }}
        onDismiss={() => setResumeTourId(null)}
      />
    </Screen>
  );
}
