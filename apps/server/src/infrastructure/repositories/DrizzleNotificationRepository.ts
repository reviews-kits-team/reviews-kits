import { db as globalDb } from '../database/db';
import * as schema from '../database/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { BunSQLDatabase } from 'drizzle-orm/bun-sql';
import type { INotificationRepository } from '../../domain/repositories/INotificationRepository';
import { Notification } from '../../domain/entities/Notification';

export class DrizzleNotificationRepository implements INotificationRepository {
  constructor(private readonly db: BunSQLDatabase<typeof schema> = globalDb) {}

  async save(notification: Notification): Promise<void> {
    const props = notification.getProps();
    await this.db.insert(schema.notifications).values({
      id: props.id,
      userId: props.userId,
      type: props.type,
      title: props.title,
      body: props.body,
      formId: props.formId,
      testimonialId: props.testimonialId,
      isRead: props.isRead,
      createdAt: props.createdAt,
    });
  }

  async findByUser(userId: string, options?: { limit?: number; offset?: number }): Promise<Notification[]> {
    const query = this.db
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, userId))
      .orderBy(desc(schema.notifications.createdAt))
      .limit(options?.limit ?? 20)
      .offset(options?.offset ?? 0);

    const rows = await query;
    return rows.map(row => this.mapToDomain(row));
  }

  async countUnread(userId: string): Promise<number> {
    const [result] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.notifications)
      .where(and(
        eq(schema.notifications.userId, userId),
        eq(schema.notifications.isRead, false),
      ));
    return Number(result?.count ?? 0);
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.db
      .update(schema.notifications)
      .set({ isRead: true })
      .where(and(
        eq(schema.notifications.id, id),
        eq(schema.notifications.userId, userId),
      ));
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.db
      .update(schema.notifications)
      .set({ isRead: true })
      .where(and(
        eq(schema.notifications.userId, userId),
        eq(schema.notifications.isRead, false),
      ));
  }

  private mapToDomain(row: typeof schema.notifications.$inferSelect): Notification {
    return new Notification({
      id: row.id,
      userId: row.userId,
      type: row.type,
      title: row.title,
      body: row.body ?? undefined,
      formId: row.formId,
      testimonialId: row.testimonialId,
      isRead: row.isRead,
      createdAt: row.createdAt,
    });
  }
}
