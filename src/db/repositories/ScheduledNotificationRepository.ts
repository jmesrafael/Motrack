import { eq, lt } from 'drizzle-orm';

import { db } from '@/db/client';
import { scheduledNotifications } from '@/db/schema';
import { nowMs } from '@/lib/dates';
import { newUuid } from '@/lib/uuid';
import { guard } from './base';

export interface NewScheduledNotification {
  notificationId: string;
  sourceType: 'schedule' | 'document' | 'system';
  sourceId: string | null;
  fireAt: number;
}

/**
 * `scheduled_notifications` (DATABASE_DESIGN.md §5.9) — operational, no soft
 * delete, excluded from backup. Tracks the OS handle for every notification
 * Motrack has scheduled so NotificationScheduler can cancel/diff on re-plan.
 */
export const ScheduledNotificationRepository = {
  listAll(): { id: string; notificationId: string; sourceType: string; sourceId: string | null; fireAt: number }[] {
    return guard('scheduledNotifications.listAll', () => db.select().from(scheduledNotifications).all());
  },

  insertMany(rows: readonly NewScheduledNotification[]): void {
    if (rows.length === 0) {
      return;
    }
    guard('scheduledNotifications.insertMany', () => {
      const at = nowMs();
      db.insert(scheduledNotifications)
        .values(rows.map((r) => ({ id: newUuid(), createdAt: at, ...r })))
        .run();
    });
  },

  deleteAll(): void {
    guard('scheduledNotifications.deleteAll', () => db.delete(scheduledNotifications).run());
  },

  /** Prunes rows whose fire_at already passed (NOTIFICATION_ENGINE.md §9). */
  prunePast(beforeMs: number): void {
    guard('scheduledNotifications.prunePast', () =>
      db.delete(scheduledNotifications).where(lt(scheduledNotifications.fireAt, beforeMs)).run(),
    );
  },

  deleteById(id: string): void {
    guard('scheduledNotifications.deleteById', () =>
      db.delete(scheduledNotifications).where(eq(scheduledNotifications.id, id)).run(),
    );
  },
};
