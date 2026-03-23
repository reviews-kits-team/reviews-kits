import { eq, and } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { apiKeys } from '../database/schema';
import { ApiKey } from '../../domain/entities/ApiKey';
import type { ApiKeyRepository } from '../../domain/repositories/ApiKeyRepository';

export class DrizzleApiKeyRepository implements ApiKeyRepository {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  async findById(id: string): Promise<ApiKey | null> {
    const [row] = await this.db.select().from(apiKeys).where(eq(apiKeys.id, id));
    if (!row) return null;
    return this.mapToDomain(row);
  }

  async findByHash(keyHash: string): Promise<ApiKey | null> {
    const [row] = await this.db.select().from(apiKeys).where(and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.isActive, true)));
    if (!row) return null;
    return this.mapToDomain(row);
  }

  async findByUser(userId: string): Promise<ApiKey[]> {
    const rows = await this.db.select().from(apiKeys).where(eq(apiKeys.userId, userId));
    return rows.map(row => this.mapToDomain(row));
  }

  async save(apiKey: ApiKey): Promise<void> {
    const props = apiKey.getProps();
    await this.db.insert(apiKeys).values({
      id: props.id,
      userId: props.userId,
      keyHash: props.keyHash,
      keyPrefix: props.keyPrefix,
      type: props.type,
      name: props.name,
      lastUsed: props.lastUsed,
      expiresAt: props.expiresAt,
      isActive: props.isActive,
      createdAt: props.createdAt,
    });
  }

  async update(apiKey: ApiKey): Promise<void> {
    const props = apiKey.getProps();
    await this.db.update(apiKeys)
      .set({
        lastUsed: props.lastUsed,
        isActive: props.isActive,
        expiresAt: props.expiresAt,
        name: props.name,
      })
      .where(eq(apiKeys.id, props.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(apiKeys).where(eq(apiKeys.id, id));
  }

  private mapToDomain(row: typeof schema.apiKeys.$inferSelect): ApiKey {
    return new ApiKey({
      id: row.id,
      userId: row.userId,
      keyHash: row.keyHash,
      keyPrefix: row.keyPrefix,
      type: row.type as 'public' | 'secret',
      name: row.name || undefined,
      lastUsed: row.lastUsed || undefined,
      expiresAt: row.expiresAt || undefined,
      isActive: row.isActive ?? true,
      createdAt: row.createdAt || undefined,
    });
  }
}
