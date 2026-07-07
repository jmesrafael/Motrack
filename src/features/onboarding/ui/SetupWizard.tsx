import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DateField } from '@/components/DateField';
import { FormField } from '@/components/FormField';
import { Icon } from '@/components/Icon';
import { OdoInput } from '@/components/OdoInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SecondaryButton } from '@/components/SecondaryButton';
import { Toggle } from '@/components/Toggle';
import { ScheduleRepository } from '@/db/repositories/ScheduleRepository';
import type { MotorcycleRow } from '@/db/schema';
import { componentDefaultServiceType } from '@/db/seed/defaults';
import { BikeForm, toMotorcycleInput, type BikeFormValues } from '@/features/garage/ui/BikeForm';
import { interpolate, strings } from '@/i18n/strings';
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
 */

type WizardStep = 'bike' | 'oil' | 'initial' | 'done';

const INITIAL_COMPONENT_OPTIONS: ComponentType[] = [
  'air_filter_clean',
  'spark_plug',
  'brake_fluid',
  'cvt_cleaning',
  'chain_lube',
];

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
    closeButton: {
      width: 44,
      height: 44,
      borderRadius: t.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepTitle: typeStyle(t.type.h2, t.text.primary),
    stepBody: typeStyle(t.type.body, t.text.secondary),
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
      minHeight: 44,
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

  // Initial maintenance step state
  const [selected, setSelected] = useState<Set<ComponentType>>(new Set());
  const [initialDate, setInitialDate] = useState(todayIso());
  const [initialMessage, setInitialMessage] = useState<{
    kind: 'error' | 'success';
    text: string;
  }>();

  const stepOrder: WizardStep[] = ['bike', 'oil', 'initial', 'done'];
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
      setStep('initial');
      return;
    }
    const odo = oilOdo.trim() !== '' ? Number(oilOdo) : null;
    const error = recordService(bike, 'engine_oil', oilDate, odo);
    if (error !== null) {
      setOilMessage({ kind: 'error', text: error });
      return;
    }
    setOilMessage({ kind: 'success', text: strings.onboarding.setup.oil.saved });
    setStep('initial');
  };

  const saveInitialMaintenance = () => {
    if (bike === null || selected.size === 0) {
      setStep('done');
      return;
    }
    let saved = 0;
    let firstError: string | null = null;
    for (const componentType of selected) {
      const error = recordService(bike, componentType, initialDate, null);
      if (error === null) {
        saved += 1;
      } else if (firstError === null) {
        firstError = error;
      }
    }
    if (firstError !== null && saved === 0) {
      setInitialMessage({ kind: 'error', text: firstError });
      return;
    }
    setInitialMessage({
      kind: 'success',
      text: interpolate(strings.onboarding.setup.initial.saved, { count: saved }),
    });
    setStep('done');
  };

  const toggleComponent = (componentType: ComponentType) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(componentType)) {
        next.delete(componentType);
      } else {
        next.add(componentType);
      }
      return next;
    });
  };

  const skipStep = () => {
    if (step === 'bike') {
      finish('skipped');
    } else if (step === 'oil') {
      setStep('initial');
    } else if (step === 'initial') {
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
        </View>
        <Pressable
          onPress={() => setConfirmingExit(true)}
          accessibilityRole="button"
          accessibilityLabel={strings.onboarding.setup.closeA11y}
          style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.7 }]}>
          <Icon name="close" size={tokens.iconSize.md} color={tokens.icon.secondary} />
        </Pressable>
      </View>

      {step === 'bike' ? (
        <>
          <Text style={styles.stepTitle}>{strings.onboarding.setup.bike.title}</Text>
          <Text style={styles.stepBody}>{strings.onboarding.setup.bike.body}</Text>
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

      {step === 'initial' ? (
        <>
          <Text style={styles.stepTitle}>{strings.onboarding.setup.initial.title}</Text>
          <Text style={styles.stepBody}>{strings.onboarding.setup.initial.body}</Text>
          {INITIAL_COMPONENT_OPTIONS.map((componentType) => (
            <Toggle
              key={componentType}
              label={strings.components[componentType]}
              value={selected.has(componentType)}
              onChange={() => toggleComponent(componentType)}
            />
          ))}
          <FormField label={strings.onboarding.setup.initial.dateLabel}>
            <DateField value={initialDate} onChange={setInitialDate} maxIso={todayIso()} />
          </FormField>
          {initialMessage !== undefined ? (
            <Text style={initialMessage.kind === 'error' ? styles.error : styles.success}>
              {initialMessage.text}
            </Text>
          ) : null}
          <PrimaryButton
            label={strings.onboarding.setup.initial.save}
            onPress={saveInitialMaintenance}
          />
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
            onPress={() => finish('completed')}
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
        onConfirm={exitEarly}
        onCancel={() => setConfirmingExit(false)}
      />
    </Screen>
  );
}
