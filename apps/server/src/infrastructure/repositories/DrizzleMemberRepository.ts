import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { members, users } from '../database/schema';
import type { MemberRepository, MemberDetails } from '../../domain/repositories/MemberRepository';

export class DrizzleMemberRepository implements MemberRepository {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  async findByOrganizationId(organizationId: string): Promise<MemberDetails[]> {
    const rows = await this.db
      .select({
        id: members.id,
        role: members.role,
        createdAt: members.createdAt,
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
      })
      .from(members)
      .innerJoin(users, eq(members.userId, users.id))
      .where(eq(members.organizationId, organizationId));

    return rows;
  }
}
