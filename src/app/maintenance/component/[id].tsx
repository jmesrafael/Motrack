import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { OdoInput } from '@/components/OdoInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SecondaryButton } from '@/components/SecondaryButton';
import { StatusPill } from '@/components/StatusPill';
import { TimelineItem } from '@/components/TimelineItem';
import { MaintenanceRepository } from '@/db/repositories/MaintenanceRepository';
import { MotorcycleRepository } from '@/db/repositories/MotorcycleRepository';
import { ScheduleRepository } from '@/db/repositories/ScheduleRepository';
import { componentIcon, componentLabel } from '@/features/maintenance/componentMeta';
import { formatRemaining } from '@/features/maintenance/remainingText';
import { strings } from '@/i18n/strings';
import { todayIso } from '@/lib/dates';
import { formatMoney, formatMonthDay } from '@/lib/format';
import { ScheduleService } from '@/services/ScheduleService';
import { computeScheduleStatus } from '@/services/StatusService';
import { makeStyles, typeStyle } from '@/theme/styles';
import type { ComponentType } from '@/types/enums';

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    title: typeStyle(t.type.h1, t.text.primary),
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    caption: typeStyle(t.type.caption, t.text.secondary),
    sectionTitle: { ...typeStyle(t.type.h2, t.text.primary), marginTop: t.space.s4 },
    baselineRow: { flexDirection: 'row', gap: t.space.s2, alignItems: 'flex-end' },
  }),
);

/** S-11 Component detail — status, interval config, baseline, and history. */
export default function ComponentDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const styles = useStyles();
  const [baselineOdo, setBaselineOdo] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const schedule = ScheduleRepository.getById(id);
  const bike = schedule !== undefined ? MotorcycleRepository.getById(schedule.motorcycleId) : undefined;

  const status = useMemo(() => {
    if (schedule === undefined || bike === undefined) {
      return null;
    }
    return computeScheduleStatus(schedule, bike.currentOdometerKm, todayIso());
  }, [schedule, bike, refreshKey]);

  const records = useMemo(
    () => (schedule !== undefined ? MaintenanceRepository.listByBike(schedule.motorcycleId, { scheduleId: id, limit: 20 }) : []),
    [schedule, id, refreshKey],
  );

  const totalSpent = useMemo(
    () => (schedule !== undefined ? MaintenanceRepository.totalCostForSchedule(id) : 0),
    [schedule, id, refreshKey],
  );

  if (schedule === undefined || bike === undefined || status === null) {
    return (
      <Screen>
        <Text style={styles.title}>Not found</Text>
      </Screen>
    );
  }

  const componentType = schedule.componentType as ComponentType;
  const label = componentLabel(componentType, schedule.customName);

  const handleBaseline = () => {
    const result = ScheduleService.setBaseline({
      scheduleId: id,
      lastDoneOdometerKm: baselineOdo !== '' ? Number(baselineOdo) : null,
      lastDoneDate: todayIso(),
    });
    if (result.ok) {
      setRefreshKey((k) => k + 1);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>{label}</Text>
      <Card>
        <View style={styles.row}>
          <StatusPill status={status.status} label={strings.dashboard.nextMaintenance.due[status.status]} />
          <Text style={styles.caption}>{formatRemaining(status)}</Text>
        </View>
        <Text style={styles.caption}>
          Interval: {schedule.intervalKm !== null ? `${schedule.intervalKm} km` : ''}
          {schedule.intervalKm !== null && schedule.intervalMonths !== null ? ' / ' : ''}
          {schedule.intervalMonths !== null ? `${schedule.intervalMonths} mo` : ''}
        </Text>
      </Card>

      {status.anchored === false ? (
        <Card>
          <Text style={styles.caption}>Not set up — when was this last done?</Text>
          <View style={styles.baselineRow}>
            <OdoInput value={baselineOdo} onChange={setBaselineOdo} />
            <PrimaryButton label="Save baseline" onPress={handleBaseline} />
          </View>
          <SecondaryButton
            label="Just serviced today"
            onPress={() => {
              const result = ScheduleService.setBaseline({
                scheduleId: id,
                lastDoneOdometerKm: bike.currentOdometerKm,
                lastDoneDate: todayIso(),
              });
              if (result.ok) {
                setRefreshKey((k) => k + 1);
              }
            }}
          />
        </Card>
      ) : null}

      <View style={styles.row}>
        <Text style={styles.sectionTitle}>Total spent</Text>
        <Text style={styles.caption}>{formatMoney(totalSpent)}</Text>
      </View>

      <PrimaryButton
        label="Log this component"
        onPress={() => router.push(`/maintenance/log?scheduleId=${id}`)}
      />
      <SecondaryButton label="Edit interval" onPress={() => router.push(`/maintenance/schedule/${id}`)} />

      <Text style={styles.sectionTitle}>History</Text>
      {records.map((record) => (
        <TimelineItem
          key={record.id}
          icon={componentIcon(componentType)}
          title={label}
          caption={
            record.odometerKm !== null
              ? `${formatMonthDay(record.performedDate)} · ${record.odometerKm.toLocaleString('en-PH')} km`
              : formatMonthDay(record.performedDate)
          }
          amount={record.costCentavos !== null ? formatMoney(record.costCentavos) : '—'}
          onPress={() => router.push(`/maintenance/log?recordId=${record.id}`)}
        />
      ))}
    </Screen>
  );
}
