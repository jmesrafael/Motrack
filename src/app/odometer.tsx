import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { OdoInput } from '@/components/OdoInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SecondaryButton } from '@/components/SecondaryButton';
import { useActiveBike } from '@/hooks/useActiveBike';
import { formatKm, formatMonthDay } from '@/lib/format';
import { todayIso } from '@/lib/dates';
import { OdometerService } from '@/services/OdometerService';
import { makeStyles, typeStyle } from '@/theme/styles';

const useStyles = makeStyles((t) => ({
  title: typeStyle(t.type.h1, t.text.primary),
  caption: typeStyle(t.type.caption, t.text.secondary),
  error: typeStyle(t.type.caption, t.feedback.error.base),
}));

/** S-25 Odometer update modal (R-12) — big-keypad reading with §6.3 correction options. */
export default function OdometerUpdateRoute() {
  const router = useRouter();
  const styles = useStyles();
  const { activeBike } = useActiveBike();
  const [reading, setReading] = useState('');
  const [violation, setViolation] = useState<string>();
  const [showMeterReplace, setShowMeterReplace] = useState(false);

  if (activeBike === null) {
    return (
      <Screen>
        <Text style={styles.title}>No motorcycle selected</Text>
      </Screen>
    );
  }

  const handleSave = () => {
    const result = OdometerService.logManualReading(activeBike.id, {
      readingKm: Number(reading),
      recordedDate: todayIso(),
    });
    if (!result.ok) {
      setViolation(result.error.message);
      setShowMeterReplace(result.error.kind === 'ValidationError');
      return;
    }
    router.back();
  };

  const handleMeterReplace = () => {
    const result = OdometerService.replaceMeter(activeBike.id, Number(reading), todayIso());
    if (result.ok) {
      router.back();
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Update odometer</Text>
      <Text style={styles.caption}>
        Current: {formatKm(activeBike.currentOdometerKm)} as of {formatMonthDay(todayIso())}
      </Text>
      <OdoInput value={reading} onChange={setReading} lastReadingKm={activeBike.currentOdometerKm} />
      {violation !== undefined ? <Text style={styles.error}>{violation}</Text> : null}
      <PrimaryButton label="Save" onPress={handleSave} disabled={reading === ''} />
      {showMeterReplace ? (
        <>
          <SecondaryButton
            label="A past entry is wrong"
            onPress={() => router.push('/odometer/log')}
          />
          <SecondaryButton label="The odometer/meter was replaced" onPress={handleMeterReplace} />
        </>
      ) : null}
    </Screen>
  );
}
