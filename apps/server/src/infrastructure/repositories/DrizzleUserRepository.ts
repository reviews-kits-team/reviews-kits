import { db as globalDb } from '../database/db';
import * as schema from '../database/schema';
import { eq } from 'drizzle-orm';
import type { BunSQLDatabase } from 'drizzle-orm/bun-sql';
import type { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

export class DrizzleUserRepository implements IUserRepository {
  constructor(private readonly db: BunSQLDatabase<typeof schema> = globalDb) {}

  async findAll(options?: { limit?: number; offset?: number }): Promise<User[]> {
    const query = this.db.select().from(schema.users);
    
    if (options?.limit) query.limit(options.limit);
    if (options?.offset) query.offset(options.offset);

    const results = await query;
    return results.map(row => this.mapToDomain(row));
  }

  async findById(id: string): Promise<User | null> {
    const [row] = await this.db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    if (!row) return null;
    return this.mapToDomain(row);
  }

  async findByEmail(email: string): Promise<User | null> {
    const [row] = await this.db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    if (!row) return null;
    return this.mapToDomain(row);
  }

  async update(user: User): Promise<void> {
    const props = user.getProps();
    await this.db.update(schema.users)
      .set({
        email: props.email,
        name: props.name,
        image: props.avatarUrl,
        notificationPrefs: props.notificationPrefs,
        updatedAt: props.updatedAt,
      })
      .where(eq(schema.users.id, user.id));
  }

  private mapToDomain(row: typeof schema.users.$inferSelect): User {
    return new User({
      id: row.id,
      email: row.email,
      name: row.name,
      emailVerified: row.emailVerified,
      isSystemAdmin: row.isSystemAdmin,
      avatarUrl: row.image,
      notificationPrefs: (row.notificationPrefs as any) ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
