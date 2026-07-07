import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { OdoInput } from '@/components/OdoInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SecondaryButton } from '@/components/SecondaryButton';
import { OdometerRepository } from '@/db/repositories/OdometerRepository';
import { useActiveBike } from '@/hooks/useActiveBike';
import { formatMonthDay } from '@/lib/format';
import { OdometerService } from '@/services/OdometerService';
import { makeStyles, typeStyle } from '@/theme/styles';

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    title: typeStyle(t.type.h1, t.text.primary),
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    caption: typeStyle(t.type.caption, t.text.secondary),
    reading: { ...typeStyle(t.type.bodyStrong, t.text.primary), fontVariant: ['tabular-nums'] },
    editRow: { flexDirection: 'row', gap: t.space.s2, marginTop: t.space.s2 },
  }),
);

/** S-25b Odometer log — chronological entries with source, edit/delete (re-validated). */
export default function OdometerLogListRoute() {
  const styles = useStyles();
  const { activeBike } = useActiveBike();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState<string>();

  if (activeBike === null) {
    return (
      <Screen>
        <Text style={styles.title}>No motorcycle selected</Text>
      </Screen>
    );
  }

  const logs = OdometerRepository.listByBike(activeBike.id, 100);
  void refreshKey;

  const handleSaveEdit = (id: string) => {
    const result = OdometerService.editReading(id, Number(editValue));
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setError(undefined);
    setEditingId(null);
    setRefreshKey((k) => k + 1);
  };

  const handleDelete = (id: string) => {
    OdometerService.deleteReading(id);
    setRefreshKey((k) => k + 1);
  };

  return (
    <Screen>
      <Text style={styles.title}>Odometer entries</Text>
      {error !== undefined ? <Text style={styles.caption}>{error}</Text> : null}
      {logs.map((log) => (
        <Card key={log.id}>
          <View style={styles.row}>
            <View>
              <Text style={styles.reading}>{log.readingKm.toLocaleString('en-PH')} km</Text>
              <Text style={styles.caption}>
                {formatMonthDay(log.recordedDate)} · {log.source}
              </Text>
            </View>
            {editingId !== log.id ? (
              <SecondaryButton
                label="Edit"
                onPress={() => {
                  setEditingId(log.id);
                  setEditValue(String(log.readingKm));
                }}
              />
            ) : null}
          </View>
          {editingId === log.id ? (
            <View style={styles.editRow}>
              <OdoInput value={editValue} onChange={setEditValue} />
              <PrimaryButton label="Save" onPress={() => handleSaveEdit(log.id)} />
              <SecondaryButton label="Delete" onPress={() => handleDelete(log.id)} />
            </View>
          ) : null}
        </Card>
      ))}
    </Screen>
  );
}
