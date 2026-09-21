import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DestructiveButton } from '@/components/DestructiveButton';
import { DraggableList } from '@/components/DraggableList';
import { EmptyState } from '@/components/EmptyState';
import { FormField } from '@/components/FormField';
import { Icon } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SecondaryButton } from '@/components/SecondaryButton';
import { TextField } from '@/components/TextField';
import { showToast } from '@/components/Toast';
import { MaintenanceRepository } from '@/db/repositories/MaintenanceRepository';
import { ScheduleRepository } from '@/db/repositories/ScheduleRepository';
import type { ScheduleRow } from '@/db/schema';
import { useActiveBike } from '@/hooks/useActiveBike';
import { ScheduleService } from '@/services/ScheduleService';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

const ROW_HEIGHT = 64;

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    title: typeStyle(t.type.h1, t.text.primary),
    error: typeStyle(t.type.caption, t.feedback.error.base),
    sectionTitle: { ...typeStyle(t.type.h2, t.text.primary), marginTop: t.space.s4 },
    sectionCaption: typeStyle(t.type.caption, t.text.secondary),
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    row: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s3,
      paddingHorizontal: t.space.s4,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: t.radius.sm,
      borderWidth: 2,
      borderColor: t.border.strong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxActive: { borderColor: t.primary.base, backgroundColor: t.primary.base },
    rowText: { flex: 1, gap: 2 },
    rowLabel: typeStyle(t.type.bodyStrong, t.text.primary),
    rowCaption: typeStyle(t.type.caption, t.text.secondary),
    card: { padding: 0, marginBottom: t.space.s2 },
  }),
);

function intervalSummary(schedule: ScheduleRow): string {
  const parts: string[] = [];
  if (schedule.intervalKm !== null) {
    parts.push(`${schedule.intervalKm.toLocaleString('en-PH')} km`);
  }
  if (schedule.intervalMonths !== null) {
    parts.push(`${schedule.intervalMonths} mo`);
  }
  return parts.join(' / ') || 'No interval set';
}

/** Custom Components management (item 13): create, list with drag-to-reorder, multi-select batch delete. */
export default function CustomComponentsRoute() {
  const router = useRouter();
  const styles = useStyles();
  const { tokens } = useTheme();
  const { activeBike } = useActiveBike();
  const [name, setName] = useState('');
  const [intervalKm, setIntervalKm] = useState('');
  const [intervalMonths, setIntervalMonths] = useState('');
  const [error, setError] = useState<string>();
  const [refreshKey, setRefreshKey] = useState(0);
  void refreshKey;
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmingBatchDelete, setConfirmingBatchDelete] = useState(false);

  if (activeBike === null) {
    return (
      <Screen>
        <Text style={styles.title}>No motorcycle selected</Text>
      </Screen>
    );
  }

  const components = ScheduleRepository.listCustomByBike(activeBike.id);
  const historyCounts = new Map(components.map((c) => [c.id, MaintenanceRepository.countForSchedule(c.id)]));
  const selectedWithHistory = [...selected].filter((id) => (historyCounts.get(id) ?? 0) > 0).length;

  const handleAdd = () => {
    const result = ScheduleService.addCustomComponent(activeBike.id, {
      customName: name,
      intervalKm: intervalKm !== '' ? Number(intervalKm) : null,
      intervalMonths: intervalMonths !== '' ? Number(intervalMonths) : null,
    });
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setError(undefined);
    setName('');
    setIntervalKm('');
    setIntervalMonths('');
    setRefreshKey((k) => k + 1);
    showToast('Component added');
  };

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBatchDelete = () => {
    setConfirmingBatchDelete(false);
    ScheduleService.deleteCustomComponents([...selected]);
    setSelected(new Set());
    setSelectMode(false);
    setRefreshKey((k) => k + 1);
    showToast({ kind: 'info', message: `${selected.size} component(s) deleted` });
  };

  return (
    <Screen tutorialScrollId="customComponents">
      <ScreenHeader title="Custom components" />
      {error !== undefined ? <Text style={styles.error}>{error}</Text> : null}
      <FormField label="Name" required>
        <TextField value={name} onChangeText={setName} maxLength={30} placeholder="e.g. Handlebar grips" />
      </FormField>
      <FormField label="Interval (km)" hint="At least one of km/months is required">
        <TextField
          value={intervalKm}
          onChangeText={(v) => setIntervalKm(v.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
        />
      </FormField>
      <FormField label="Interval (months)">
        <TextField
          value={intervalMonths}
          onChangeText={(v) => setIntervalMonths(v.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
        />
      </FormField>
      <PrimaryButton label="Add component" onPress={handleAdd} />

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Your custom components</Text>
        {components.length > 0 ? (
          <SecondaryButton
            label={selectMode ? 'Cancel' : 'Select'}
            size="sm"
            onPress={() => {
              setSelectMode((v) => !v);
              setSelected(new Set());
            }}
          />
        ) : null}
      </View>

      {components.length === 0 ? (
        <EmptyState
          icon="maintenance"
          title="No custom components yet"
          body="Add one above, like handlebar grips or a battery, to track its own maintenance schedule."
        />
      ) : (
        <>
          <Text style={styles.sectionCaption}>
            {selectMode ? 'Tap to select, then delete.' : 'Drag the handle to reorder.'}
          </Text>
          <DraggableList
            data={components}
            keyExtractor={(c) => c.id}
            itemHeight={ROW_HEIGHT}
            disabled={selectMode}
            onReorder={(next) => {
              ScheduleService.reorderCustomComponents(
                activeBike.id,
                next.map((c) => c.id),
              );
              setRefreshKey((k) => k + 1);
            }}
            renderItem={(schedule) => {
              const isSelected = selected.has(schedule.id);
              return (
                <Card style={styles.card}>
                  <PressableScale
                    containerStyle={{ width: '100%' }}
                    style={[styles.row, { height: ROW_HEIGHT }]}
                    onPress={() =>
                      selectMode ? toggleSelected(schedule.id) : router.push(`/maintenance/schedule/${schedule.id}`)
                    }
                    accessibilityRole="button"
                    accessibilityLabel={schedule.customName ?? 'Custom component'}>
                    {selectMode ? (
                      <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                        {isSelected ? (
                          <Icon name="check" size={tokens.iconSize.inline} color={tokens.primary.on} />
                        ) : null}
                      </View>
                    ) : null}
                    <View style={styles.rowText}>
                      <Text style={styles.rowLabel} numberOfLines={1}>
                        {schedule.customName ?? 'Custom component'}
                      </Text>
                      <Text style={styles.rowCaption}>{intervalSummary(schedule)}</Text>
                    </View>
                    {!selectMode ? (
                      <Icon name="chevronRight" size={tokens.iconSize.inline} color={tokens.icon.secondary} />
                    ) : null}
                  </PressableScale>
                </Card>
              );
            }}
          />
        </>
      )}

      {selectMode && selected.size > 0 ? (
        <DestructiveButton
          label={`Delete ${selected.size} selected`}
          onPress={() => setConfirmingBatchDelete(true)}
        />
      ) : null}

      <ConfirmDialog
        visible={confirmingBatchDelete}
        title={`Delete ${selected.size} component${selected.size === 1 ? '' : 's'}?`}
        body={
          selectedWithHistory > 0
            ? `${selectedWithHistory} of these have logged maintenance history. The components will be removed from your list, but their logged services and costs are kept and stay visible in History.`
            : 'These components will be removed from your list. They have no logged maintenance history yet.'
        }
        confirmLabel="Delete components"
        onConfirm={handleBatchDelete}
        onCancel={() => setConfirmingBatchDelete(false)}
      />
    </Screen>
  );
}
