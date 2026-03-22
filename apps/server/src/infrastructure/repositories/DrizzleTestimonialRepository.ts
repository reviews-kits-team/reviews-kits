import { eq, and, sql, count, avg, countDistinct } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { testimonials } from '../database/schema';
import { Testimonial } from '../../domain/entities/Testimonial';
import type { TestimonialRepository } from '../../domain/repositories/TestimonialRepository';
import { Rating } from '../../domain/value-objects/Rating';
import { Email } from '../../domain/value-objects/Email';

export class DrizzleTestimonialRepository implements TestimonialRepository {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  async findById(id: string): Promise<Testimonial | null> {
    const [row] = await this.db.select().from(testimonials).where(eq(testimonials.id, id));
    if (!row) return null;

    return this.mapToDomain(row);
  }

  async findByUser(userId: string, filters?: any): Promise<Testimonial[]> {
    const whereConditions = [eq(testimonials.userId, userId)];
    
    if (filters?.status) {
      whereConditions.push(eq(testimonials.status, filters.status));
    }

    const rows = await this.db.select()
      .from(testimonials)
      .where(and(...whereConditions));
      
    return rows.map(row => this.mapToDomain(row));
  }

  async save(testimonial: Testimonial): Promise<void> {
    const props = testimonial.getProps();
    await this.db.insert(testimonials).values({
      id: props.id,
      userId: props.userId,
      formId: props.formId,
      content: props.content,
      authorName: props.authorName,
      status: props.status,
      source: props.source,
      rating: props.rating?.getValue(),
      authorEmail: props.authorEmail?.getValue(),
      authorTitle: props.authorTitle,
      authorUrl: props.authorUrl,
      mediaId: props.mediaId,
      metadata: props.metadata,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  async update(testimonial: Testimonial): Promise<void> {
    const props = testimonial.getProps();
    await this.db.update(testimonials)
      .set({
        status: props.status,
        content: props.content,
        authorName: props.authorName,
        rating: props.rating?.getValue(),
        authorEmail: props.authorEmail?.getValue(),
        authorTitle: props.authorTitle,
        authorUrl: props.authorUrl,
        mediaId: props.mediaId,
        metadata: props.metadata,
        updatedAt: props.updatedAt,
      })
      .where(eq(testimonials.id, props.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(testimonials).where(eq(testimonials.id, id));
  }

  async findApprovedByUser(userId: string, options: { limit?: number; minRating?: number; formId: string }): Promise<Testimonial[]> {
    const { gte } = await import('drizzle-orm');
    const whereConditions = [
      eq(testimonials.userId, userId),
      eq(testimonials.status, 'approved')
    ];

    if (options?.minRating) {
      whereConditions.push(gte(testimonials.rating, options.minRating));
    }

    if (options?.formId) {
      whereConditions.push(eq(testimonials.formId, options.formId));
    }

    const query = this.db.select()
      .from(testimonials)
      .where(and(...whereConditions))
      .orderBy(testimonials.createdAt);

    if (options?.limit) {
      query.limit(options.limit);
    }

    const rows = await query;
    return rows.map(row => this.mapToDomain(row));
  }

  async getStatsByUser(userId: string): Promise<{
    totalReviews: number;
    averageRating: number;
    uniqueRespondents: number;
  }> {
    const [result] = await this.db.select({
      totalReviews: count(testimonials.id),
      averageRating: avg(testimonials.rating),
      uniqueRespondents: countDistinct(testimonials.authorEmail),
    })
    .from(testimonials)
    .where(eq(testimonials.userId, userId));

    return {
      totalReviews: Number(result?.totalReviews) || 0,
      averageRating: Number(result?.averageRating) || 0,
      uniqueRespondents: Number(result?.uniqueRespondents) || 0,
    };
  }

  private mapToDomain(row: any): Testimonial {
    return new Testimonial({
      id: row.id,
      userId: row.userId,
      content: row.content,
      authorName: row.authorName,
      status: row.status as any,
      source: row.source as any,
      rating: row.rating ? Rating.create(row.rating) : undefined,
      authorEmail: row.authorEmail ? Email.create(row.authorEmail) : undefined,
      authorTitle: row.authorTitle || undefined,
      authorUrl: row.authorUrl || undefined,
      formId: row.formId || undefined,
      mediaId: row.mediaId || undefined,
      metadata: row.metadata as any,
      createdAt: row.createdAt || undefined,
      updatedAt: row.updatedAt || undefined,
    });
  }
}
