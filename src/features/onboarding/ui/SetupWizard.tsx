import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DateField } from '@/components/DateField';
import { FormField } from '@/components/FormField';
import { Icon } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { OdoInput } from '@/components/OdoInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SecondaryButton } from '@/components/SecondaryButton';
import { showToast } from '@/components/Toast';
import { ScheduleRepository } from '@/db/repositories/ScheduleRepository';
import type { MotorcycleRow } from '@/db/schema';
import { componentDefaultServiceType } from '@/db/seed/defaults';
import { BikeForm, toMotorcycleInput, type BikeFormValues } from '@/features/garage/ui/BikeForm';
import { interpolate } from '@/i18n/strings';
import { useStrings } from '@/i18n/useStrings';
import { todayIso } from '@/lib/dates';
import { MaintenanceService } from '@/services/MaintenanceService';
import { MotorcycleService } from '@/services/MotorcycleService';
import { useTutorialStore } from '@/stores/useTutorialStore';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';
import type { ComponentType } from '@/types/enums';

/**
 * Optional setup wizard (single route, internal steps — hardware back pops to
 * welcome, wizard Back walks steps). Non-negotiables from the onboarding
 * spec: every step has Back / Skip / X-exit, abandoning keeps whatever was
 * already saved, and skipping opens the app normally.
 *
 * Step 3 used to also collect "recent maintenance" (a toggle per component
 * plus a shared date that got written as each one's last-serviced date).
 * That mixed "add a bike" with a second, confusing data-entry concept during
 * first run, so it was removed: maintenance dates/baselines are entered the
 * same way any existing user does it, from the component screen in
 * Maintenance ("Just serviced today" / "Save baseline"), with the concept
 * explained in Help & Tutorials instead of during setup.
 */

type WizardStep = 'bike' | 'oil' | 'done';

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s2,
    },
    headerText: { flex: 1, gap: 2 },
    title: typeStyle(t.type.h1, t.text.primary),
    progress: typeStyle(t.type.caption, t.text.secondary),
    progressTrack: {
      height: 4,
      borderRadius: 2,
      backgroundColor: t.bg.surfaceVariant,
      marginTop: t.space.s1,
      overflow: 'hidden',
    },
    progressFill: {
      height: 4,
      borderRadius: 2,
      backgroundColor: t.primary.base,
    },
    stepTitle: typeStyle(t.type.h2, t.text.primary),
    stepBody: typeStyle(t.type.body, t.text.secondary),
    stepWhy: { ...typeStyle(t.type.caption, t.text.tertiary), marginTop: -t.space.s2 },
    error: typeStyle(t.type.caption, t.feedback.error.base),
    success: typeStyle(t.type.caption, t.feedback.success.base),
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s2,
      marginTop: t.space.s4,
    },
    footerSpacer: { flex: 1 },
    skipButton: {
      minHeight: t.size.buttonMd,
      justifyContent: 'center',
      paddingHorizontal: t.space.s2,
    },
    skipLabel: typeStyle(t.type.bodyStrong, t.text.secondary),
    doneWrap: {
      alignItems: 'center',
      gap: t.space.s4,
      marginTop: t.space.s10,
    },
    doneIconWell: {
      width: 96,
      height: 96,
      borderRadius: t.radius.full,
      backgroundColor: t.feedback.success.bg,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);

export function SetupWizard() {
  const styles = useStyles();
  const router = useRouter();
  const { tokens } = useTheme();
  const strings = useStrings();
  const markSetup = useTutorialStore((s) => s.markSetup);

  const [step, setStep] = useState<WizardStep>('bike');
  const [bike, setBike] = useState<MotorcycleRow | null>(null);
  const [confirmingExit, setConfirmingExit] = useState(false);

  // Bike step state
  const [submittingBike, setSubmittingBike] = useState(false);
  const [bikeFieldErrors, setBikeFieldErrors] = useState<Record<string, string>>();
  const [bikeError, setBikeError] = useState<string>();

  // Oil step state
  const [oilDate, setOilDate] = useState(todayIso());
  const [oilOdo, setOilOdo] = useState('');
  const [oilMessage, setOilMessage] = useState<{ kind: 'error' | 'success'; text: string }>();

  const stepOrder: WizardStep[] = ['bike', 'oil', 'done'];
  const stepIndex = stepOrder.indexOf(step);

  const finish = (outcome: 'completed' | 'skipped') => {
    markSetup(outcome);
    router.replace('/(tabs)');
  };

  const exitEarly = () => {
    setConfirmingExit(false);
    finish(bike !== null ? 'completed' : 'skipped');
  };

  const goBack = () => {
    if (stepIndex > 0) {
      setStep(stepOrder[stepIndex - 1] ?? 'bike');
    } else {
      router.back();
    }
  };

  const handleBikeSubmit = (values: BikeFormValues) => {
    setSubmittingBike(true);
    setBikeError(undefined);
    const result = MotorcycleService.createBike(toMotorcycleInput(values));
    setSubmittingBike(false);
    if (!result.ok) {
      setBikeFieldErrors(result.error.fieldErrors);
      setBikeError(result.error.message);
      return;
    }
    setBike(result.value);
    setStep('oil');
  };

  const recordService = (
    motorcycle: MotorcycleRow,
    componentType: ComponentType,
    performedDate: string,
    odometerKm: number | null,
  ): string | null => {
    const schedule = ScheduleRepository.listByBike(motorcycle.id).find(
      (s) => s.componentType === componentType,
    );
    if (schedule === undefined) {
      return null;
    }
    const result = MaintenanceService.saveRecord(motorcycle.id, {
      scheduleId: schedule.id,
      performedDate,
      odometerKm,
      serviceType: componentDefaultServiceType(componentType),
      costCentavos: null,
      brand: null,
      quantity: null,
      details: null,
      notes: null,
      photoPath: null,
    });
    return result.ok ? null : result.error.message;
  };

  const saveOilChange = () => {
    if (bike === null) {
      setStep('done');
      return;
    }
    const odo = oilOdo.trim() !== '' ? Number(oilOdo) : null;
    const error = recordService(bike, 'engine_oil', oilDate, odo);
    if (error !== null) {
      setOilMessage({ kind: 'error', text: error });
      return;
    }
    setOilMessage({ kind: 'success', text: strings.onboarding.setup.oil.saved });
    setStep('done');
  };

  const skipStep = () => {
    if (step === 'bike') {
      finish('skipped');
    } else if (step === 'oil') {
      setStep('done');
    }
  };

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{strings.onboarding.setup.title}</Text>
          <Text style={styles.progress}>
            {interpolate(strings.onboarding.setup.stepOf, {
              current: stepIndex + 1,
              total: stepOrder.length,
            })}
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${((stepIndex + 1) / stepOrder.length) * 100}%` },
              ]}
            />
          </View>
        </View>
        <IconButton
          icon="close"
          onPress={() => setConfirmingExit(true)}
          accessibilityLabel={strings.onboarding.setup.closeA11y}
          variant="ghost"
        />
      </View>

      {step === 'bike' ? (
        <>
          <Text style={styles.stepTitle}>{strings.onboarding.setup.bike.title}</Text>
          <Text style={styles.stepBody}>{strings.onboarding.setup.bike.body}</Text>
          <Text style={styles.stepWhy}>{strings.onboarding.setup.bike.why}</Text>
          {bikeError !== undefined ? <Text style={styles.error}>{bikeError}</Text> : null}
          <BikeForm
            submitLabel={strings.onboarding.setup.next}
            submitting={submittingBike}
            onSubmit={handleBikeSubmit}
            fieldErrors={bikeFieldErrors}
          />
        </>
      ) : null}

      {step === 'oil' ? (
        <>
          <Text style={styles.stepTitle}>{strings.onboarding.setup.oil.title}</Text>
          <Text style={styles.stepBody}>{strings.onboarding.setup.oil.body}</Text>
          <Text style={styles.stepWhy}>{strings.onboarding.setup.oil.why}</Text>
          <FormField label={strings.onboarding.setup.oil.dateLabel}>
            <DateField value={oilDate} onChange={setOilDate} maxIso={todayIso()} />
          </FormField>
          <FormField label={strings.onboarding.setup.oil.odoLabel}>
            <OdoInput value={oilOdo} onChange={setOilOdo} />
          </FormField>
          {oilMessage !== undefined ? (
            <Text style={oilMessage.kind === 'error' ? styles.error : styles.success}>
              {oilMessage.text}
            </Text>
          ) : null}
          <PrimaryButton label={strings.onboarding.setup.oil.save} onPress={saveOilChange} />
        </>
      ) : null}

      {step === 'done' ? (
        <View style={styles.doneWrap}>
          <View style={styles.doneIconWell}>
            <Icon name="statusGood" size={48} color={tokens.feedback.success.base} />
          </View>
          <Text style={styles.stepTitle}>{strings.onboarding.setup.done.title}</Text>
          <Text style={styles.stepBody}>{strings.onboarding.setup.done.body}</Text>
          <PrimaryButton
            label={strings.onboarding.setup.done.cta}
            onPress={() => {
              showToast('Motorcycle set up');
              finish('completed');
            }}
          />
        </View>
      ) : null}

      {step !== 'done' ? (
        <View style={styles.footer}>
          <SecondaryButton label={strings.onboarding.setup.back} onPress={goBack} />
          <View style={styles.footerSpacer} />
          <Pressable
            onPress={skipStep}
            accessibilityRole="button"
            accessibilityLabel={strings.onboarding.setup.skipStep}
            style={({ pressed }) => [styles.skipButton, pressed && { opacity: 0.7 }]}>
            <Text style={styles.skipLabel}>{strings.onboarding.setup.skipStep}</Text>
          </Pressable>
        </View>
      ) : null}

      <ConfirmDialog
        visible={confirmingExit}
        title={strings.onboarding.setup.exitTitle}
        body={strings.onboarding.setup.exitBody}
        confirmLabel={strings.onboarding.setup.exitConfirm}
        destructive={false}
        onConfirm={exitEarly}
        onCancel={() => setConfirmingExit(false)}
      />
    </Screen>
  );
}
