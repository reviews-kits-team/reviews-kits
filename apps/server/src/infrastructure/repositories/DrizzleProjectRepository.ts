import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { projects } from '../database/schema';
import { Project } from '../../domain/entities/Project';
import type { ProjectRepository } from '../../domain/repositories/ProjectRepository';
import { Slug } from '../../domain/value-objects/Slug';

export class DrizzleProjectRepository implements ProjectRepository {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  async findById(id: string): Promise<Project | null> {
    const [row] = await this.db.select().from(projects).where(eq(projects.id, id));
    if (!row) return null;

    return this.mapToDomain(row);
  }

  async findBySlug(slug: string): Promise<Project | null> {
    const [row] = await this.db.select().from(projects).where(eq(projects.slug, slug));
    if (!row) return null;

    return this.mapToDomain(row);
  }

  async findByOrganization(organizationId: string): Promise<Project[]> {
    const rows = await this.db.select().from(projects).where(eq(projects.organizationId, organizationId));
    return rows.map(row => this.mapToDomain(row));
  }

  async save(project: Project): Promise<void> {
    const props = project.getProps();
    await this.db.insert(projects).values({
      id: props.id,
      organizationId: props.organizationId,
      name: props.name,
      slug: props.slug.getValue(),
      settings: props.settings,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  async update(project: Project): Promise<void> {
    const props = project.getProps();
    await this.db.update(projects)
      .set({
        name: props.name,
        slug: props.slug.getValue(),
        settings: props.settings,
        updatedAt: props.updatedAt,
      })
      .where(eq(projects.id, props.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(projects).where(eq(projects.id, id));
  }

  private mapToDomain(row: any): Project {
    return new Project({
      id: row.id,
      organizationId: row.organizationId,
      name: row.name,
      slug: Slug.create(row.slug),
      settings: row.settings as Record<string, any>,
      createdAt: row.createdAt || undefined,
      updatedAt: row.updatedAt || undefined,
    });
  }
}
