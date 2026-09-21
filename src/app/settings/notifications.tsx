import DateTimePicker from '@react-native-community/datetimepicker';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { showToast } from '@/components/Toast';
import { Toggle } from '@/components/Toggle';
import { useTheme } from '@/theme/useTheme';
import { strings } from '@/i18n/strings';
import {
  getNotificationPermissionStatus,
  loadReminderSettings,
  type PermissionStatus,
  requestNotificationPermission,
  saveReminderSettings,
  triggerReplan,
} from '@/services/NotificationScheduler';
import type { NotificationPrefs, QuietHours, ReminderSettings } from '@/services/ReminderPlanner';
import { makeStyles, typeStyle } from '@/theme/styles';

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    title: typeStyle(t.type.h1, t.text.primary),
    sectionTitle: { ...typeStyle(t.type.h2, t.text.primary), marginTop: t.space.s4 },
    caption: { ...typeStyle(t.type.caption, t.text.secondary), paddingHorizontal: t.space.s4 },
    banner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: t.feedback.warning.bg,
      borderRadius: t.radius.md,
      padding: t.space.s4,
      gap: t.space.s3,
    },
    bannerBody: { flex: 1, gap: t.space.s2 },
    bannerText: typeStyle(t.type.body, t.feedback.warning.base),
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: t.size.buttonMd,
      paddingHorizontal: t.space.s4,
    },
    timeLabel: typeStyle(t.type.body, t.text.primary),
    timeValue: typeStyle(t.type.bodyStrong, t.primary.base),
  }),
);

function timeToDate(time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(h ?? 8, m ?? 0, 0, 0);
  return date;
}

function dateToTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/** Inline time-of-day picker (HH:MM) — single-use, wraps DateTimePicker's `mode="time"`. */
function TimeRow({ label, value, onChange }: { label: string; value: string; onChange: (time: string) => void }) {
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable onPress={() => setOpen(true)} accessibilityRole="button" style={styles.timeRow}>
        <Text style={styles.timeLabel}>{label}</Text>
        <Text style={styles.timeValue}>{value}</Text>
      </Pressable>
      {open ? (
        <DateTimePicker
          value={timeToDate(value)}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_event, date) => {
            setOpen(false);
            if (date !== undefined) {
              onChange(dateToTime(date));
            }
          }}
        />
      ) : null}
    </>
  );
}

const PREF_KEYS: (keyof NotificationPrefs)[] = [
  'maintenance_due',
  'maintenance_overdue',
  'document_expiry',
  'backup_reminder',
];

/** S-31 Notification settings (NOTIFICATION_ENGINE.md §2, §3, §6). */
export default function NotificationSettingsRoute() {
  const styles = useStyles();
  const { tokens } = useTheme();
  const [settings, setSettings] = useState<ReminderSettings>(() => loadReminderSettings());
  const [permission, setPermission] = useState<PermissionStatus>('undetermined');

  useEffect(() => {
    getNotificationPermissionStatus().then(setPermission);
  }, []);

  const persist = (next: ReminderSettings) => {
    setSettings(next);
    saveReminderSettings(next);
    triggerReplan();
    showToast('Settings saved');
  };

  const setPref = (key: keyof NotificationPrefs, value: boolean) => {
    persist({ ...settings, prefs: { ...settings.prefs, [key]: value } });
  };

  const setFireTime = (time: string) => persist({ ...settings, fireTime: time });

  const setQuietHours = (quietHours: QuietHours) => persist({ ...settings, quietHours });

  const handleEnable = async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? 'granted' : 'denied');
    if (granted) {
      triggerReplan();
    }
  };

  return (
    <Screen>
      <ScreenHeader title={strings.notification.settings.title} />

      {permission !== 'granted' ? (
        <View style={styles.banner}>
          <Icon name="bellOff" size={tokens.iconSize.md} color={tokens.feedback.warning.base} />
          <View style={styles.bannerBody}>
            <Text style={styles.bannerText}>{strings.notification.settings.permissionDenied}</Text>
            <Pressable
              onPress={() => {
                if (permission === 'denied') {
                  Linking.openSettings();
                } else {
                  handleEnable();
                }
              }}
              accessibilityRole="button">
              <Text style={[styles.bannerText, { fontWeight: '700', textDecorationLine: 'underline' }]}>
                {permission === 'denied'
                  ? strings.notification.settings.openSystemSettings
                  : strings.notification.settings.masterToggle}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>{strings.notification.settings.fireTime}</Text>
      <TimeRow label={strings.notification.settings.fireTime} value={settings.fireTime} onChange={setFireTime} />

      <Text style={styles.sectionTitle}>{strings.notification.settings.quietHours}</Text>
      <Text style={styles.caption}>{strings.notification.settings.quietHoursCaption}</Text>
      {settings.quietHours !== null ? (
        <>
          <TimeRow
            label="From"
            value={settings.quietHours.start}
            onChange={(start) => setQuietHours({ start, end: settings.quietHours!.end })}
          />
          <TimeRow
            label="To"
            value={settings.quietHours.end}
            onChange={(end) => setQuietHours({ start: settings.quietHours!.start, end })}
          />
        </>
      ) : null}
      <Toggle
        label={strings.notification.settings.quietHours}
        value={settings.quietHours !== null}
        onChange={(on) => persist({ ...settings, quietHours: on ? { start: '21:00', end: '07:00' } : null })}
      />

      <Text style={styles.sectionTitle}>Types</Text>
      {PREF_KEYS.map((key) => (
        <Toggle
          key={key}
          label={strings.notification.settings.types[key]}
          value={settings.prefs[key]}
          onChange={(value) => setPref(key, value)}
        />
      ))}
    </Screen>
  );
}
