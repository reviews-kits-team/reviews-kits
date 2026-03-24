import { eq, arrayContains } from 'drizzle-orm';
import type { BunSQLDatabase } from 'drizzle-orm/bun-sql';
import * as schema from '../database/schema';
import { webhooks, webhookLogs } from '../database/schema';
import { Webhook } from '../../domain/entities/Webhook';
import type { IWebhookRepository } from '../../domain/repositories/IWebhookRepository';

export class DrizzleWebhookRepository implements IWebhookRepository {
  constructor(private readonly db: BunSQLDatabase<typeof schema>) {}

  async findById(id: string): Promise<Webhook | null> {
    const [row] = await this.db.select().from(webhooks).where(eq(webhooks.id, id));
    if (!row) return null;
    return this.mapToDomain(row);
  }

  async findByUser(userId: string): Promise<Webhook[]> {
    const rows = await this.db.select().from(webhooks).where(eq(webhooks.userId, userId));
    return rows.map(row => this.mapToDomain(row));
  }

  async findByEvent(event: string): Promise<Webhook[]> {
    // For PostgreSQL we can use arrayContains
    const rows = await this.db.select().from(webhooks).where(arrayContains(webhooks.events, [event]));
    return rows.map(row => this.mapToDomain(row));
  }

  async save(webhook: Webhook): Promise<void> {
    const props = webhook.getProps();
    await this.db.insert(webhooks).values({
      id: props.id,
      userId: props.userId,
      url: webhook.getUrl(),
      events: webhook.getEvents(),
      secret: webhook.getSecret(),
      isActive: webhook.isActive(),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  async update(webhook: Webhook): Promise<void> {
    const props = webhook.getProps();
    await this.db.update(webhooks)
      .set({
        url: props.url,
        events: props.events,
        secret: props.secret,
        isActive: props.isActive,
        updatedAt: new Date(),
      })
      .where(eq(webhooks.id, props.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(webhooks).where(eq(webhooks.id, id));
  }

  async logWebhookCall(log: {
    webhookId: string;
    event: string;
    payload: any;
    responseStatus?: number;
    responseBody?: string;
    delivered: boolean;
  }): Promise<void> {
    await this.db.insert(webhookLogs).values({
      webhookId: log.webhookId,
      event: log.event,
      payload: log.payload,
      responseStatus: log.responseStatus,
      responseBody: log.responseBody,
      delivered: log.delivered,
    });
  }

  private mapToDomain(row: typeof schema.webhooks.$inferSelect): Webhook {
    return new Webhook({
      id: row.id,
      userId: row.userId,
      url: row.url,
      events: row.events,
      secret: row.secret,
      isActive: row.isActive ?? true,
      createdAt: row.createdAt || undefined,
      updatedAt: row.updatedAt || undefined,
    });
  }
}
