import { db as globalDb } from '../database/db';
import * as schema from '../database/schema';
import { eq } from 'drizzle-orm';
import type { BunSQLDatabase } from 'drizzle-orm/bun-sql';
import type { IUserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';

export class DrizzleUserRepository implements IUserRepository {
  constructor(private readonly db: BunSQLDatabase<typeof schema> = globalDb as any) {}

  async findAll(): Promise<User[]> {
    const results = await this.db.select().from(schema.users);
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

  private mapToDomain(row: any): User {
    return new User({
      id: row.id,
      email: row.email,
      name: row.name,
      emailVerified: row.emailVerified,
      isSystemAdmin: row.isSystemAdmin,
      avatarUrl: row.image,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
