import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { organizations } from '../database/schema';
import { Organization } from '../../domain/entities/Organization';
import type { OrganizationRepository, OrganizationWithRole } from '../../domain/repositories/OrganizationRepository';
import { Slug } from '../../domain/value-objects/Slug';
import { members } from '../database/schema';

export class DrizzleOrganizationRepository implements OrganizationRepository {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  async findById(id: string): Promise<Organization | null> {
    const [row] = await this.db.select().from(organizations).where(eq(organizations.id, id));
    if (!row) return null;

    return this.mapToDomain(row);
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const [row] = await this.db.select().from(organizations).where(eq(organizations.slug, slug));
    if (!row) return null;

    return this.mapToDomain(row);
  }

  async findAll(): Promise<Organization[]> {
    const rows = await this.db.select().from(organizations);
    return rows.map(r => this.mapToDomain(r));
  }

  async findByUserId(userId: string): Promise<OrganizationWithRole[]> {
    const rows = await this.db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        logo: organizations.logo,
        createdAt: organizations.createdAt,
        role: members.role,
      })
      .from(organizations)
      .innerJoin(members, eq(organizations.id, members.organizationId))
      .where(eq(members.userId, userId));

    return rows;
  }

  async save(organization: Organization): Promise<void> {
    const props = organization.getProps();
    await this.db.insert(organizations).values({
      id: props.id,
      name: props.name,
      slug: props.slug.getValue(),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  async update(organization: Organization): Promise<void> {
    const props = organization.getProps();
    await this.db.update(organizations)
      .set({
        name: props.name,
        slug: props.slug.getValue(),
        updatedAt: props.updatedAt,
      })
      .where(eq(organizations.id, props.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(organizations).where(eq(organizations.id, id));
  }

  private mapToDomain(row: any): Organization {
    return new Organization({
      id: row.id,
      name: row.name,
      slug: Slug.create(row.slug),
      createdAt: row.createdAt || undefined,
      updatedAt: row.updatedAt || undefined,
    });
  }
}
