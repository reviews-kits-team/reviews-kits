import { and, eq, sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { forms, formVisits } from '../database/schema';
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

  async findBySlug(slug: string): Promise<Form | null> {
    const [row] = await this.db.select()
      .from(forms)
      .where(eq(forms.slug, slug));
    if (!row) return null;

    return this.mapToDomain(row);
  }

  async findByPublicId(publicId: string): Promise<Form | null> {
    const [row] = await this.db.select().from(forms).where(eq(forms.publicId, publicId));
    if (!row) return null;

    return this.mapToDomain(row);
  }

  async findByUser(userId: string): Promise<Form[]> {
    const rows = await this.db.select().from(forms).where(eq(forms.userId, userId));
    return rows.map(row => this.mapToDomain(row));
  }

  async findByIdsAndUser(ids: string[], userId: string): Promise<Form[]> {
    if (!ids || ids.length === 0) return [];
    
    const { inArray } = await import('drizzle-orm');
    const rows = await this.db.select()
      .from(forms)
      .where(and(inArray(forms.id, ids), eq(forms.userId, userId)));
      
    return rows.map(row => this.mapToDomain(row));
  }

  async save(form: Form): Promise<void> {
    const props = form.getProps();
    await this.db.insert(forms).values({
      id: props.id,
      userId: props.userId,
      name: props.name,
      slug: props.slug.getValue(),
      publicId: props.publicId,
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
        publicId: props.publicId,
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

  async incrementVisits(formId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    await this.db.insert(formVisits)
      .values({ formId, date: today, visits: 1 } as any)
      .onConflictDoUpdate({
        target: [formVisits.formId, formVisits.date],
        set: { visits: sql`${formVisits.visits} + 1`, updatedAt: new Date() }
      });
  }

  private mapToDomain(row: any): Form {
    return new Form({
      id: row.id,
      userId: row.userId,
      name: row.name,
      slug: Slug.create(row.slug),
      publicId: row.publicId,
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
