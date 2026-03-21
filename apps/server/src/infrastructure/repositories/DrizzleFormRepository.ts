import { and, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { forms } from '../database/schema';
import { Form } from '../../domain/entities/Form';
import type { FormRepository } from '../../domain/repositories/FormRepository';
import { Slug } from '../../domain/value-objects/Slug';

export class DrizzleFormRepository implements FormRepository {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  async findById(id: string): Promise<Form | null> {
    const [row] = await this.db.select().from(forms).where(eq(forms.id, id));
    if (!row) return null;

    return this.mapToDomain(row);
  }

  async findBySlug(userId: string, slug: string): Promise<Form | null> {
    const [row] = await this.db.select()
      .from(forms)
      .where(and(eq(forms.userId, userId), eq(forms.slug, slug)));
    if (!row) return null;

    return this.mapToDomain(row);
  }

  async findByUser(userId: string): Promise<Form[]> {
    const rows = await this.db.select().from(forms).where(eq(forms.userId, userId));
    return rows.map(row => this.mapToDomain(row));
  }

  async save(form: Form): Promise<void> {
    const props = form.getProps();
    await this.db.insert(forms).values({
      id: props.id,
      userId: props.userId,
      name: props.name,
      slug: props.slug.getValue(),
      description: props.description,
      thankYouMessage: props.thankYouMessage,
      config: props.config,
      accentColor: props.accentColor,
      isActive: props.isActive,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  async update(form: Form): Promise<void> {
    const props = form.getProps();
    await this.db.update(forms)
      .set({
        name: props.name,
        slug: props.slug.getValue(),
        description: props.description,
        thankYouMessage: props.thankYouMessage,
        config: props.config,
        accentColor: props.accentColor,
        isActive: props.isActive,
        updatedAt: props.updatedAt,
      })
      .where(eq(forms.id, props.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(forms).where(eq(forms.id, id));
  }

  async batchUpdateStatus(ids: string[], isActive: boolean): Promise<void> {
    const { inArray } = await import('drizzle-orm');
    await this.db.update(forms)
      .set({ isActive, updatedAt: new Date() })
      .where(inArray(forms.id, ids));
  }

  async batchDelete(ids: string[]): Promise<void> {
    const { inArray } = await import('drizzle-orm');
    await this.db.delete(forms).where(inArray(forms.id, ids));
  }

  private mapToDomain(row: any): Form {
    return new Form({
      id: row.id,
      userId: row.userId,
      name: row.name,
      slug: Slug.create(row.slug),
      description: row.description || undefined,
      thankYouMessage: row.thankYouMessage || undefined,
      config: row.config as Record<string, any>,
      accentColor: row.accentColor || undefined,
      isActive: row.isActive ?? true,
      createdAt: row.createdAt || undefined,
      updatedAt: row.updatedAt || undefined,
    });
  }
}
