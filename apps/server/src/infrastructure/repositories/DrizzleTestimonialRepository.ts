import { eq, and, sql, count, avg, countDistinct, type SQL } from 'drizzle-orm';
import type { BunSQLDatabase } from 'drizzle-orm/bun-sql';
import * as schema from '../database/schema';
import { testimonials } from '../database/schema';
import { Testimonial } from '../../domain/entities/Testimonial';
import type { ITestimonialRepository, TestimonialFilters } from '../../domain/repositories/ITestimonialRepository';
import { Rating } from '../../domain/value-objects/Rating';
import { Email } from '../../domain/value-objects/Email';

export class DrizzleTestimonialRepository implements ITestimonialRepository {
  constructor(private readonly db: BunSQLDatabase<typeof schema>) {}

  async findById(id: string): Promise<Testimonial | null> {
    const [row] = await this.db.select().from(testimonials).where(eq(testimonials.id, id));
    if (!row) return null;

    return this.mapToDomain(row);
  }

  async findByUser(userId: string, filters?: TestimonialFilters): Promise<Testimonial[]> {
    const whereConditions = [eq(testimonials.userId, userId)];
    
    if (filters?.status) {
      whereConditions.push(eq(testimonials.status, filters.status));
    }

    const rows = await this.db.select()
      .from(testimonials)
      .where(and(...whereConditions));
      
    return rows.map(row => this.mapToDomain(row));
  }

  async findByIdsAndUser(ids: string[], userId: string): Promise<Testimonial[]> {
    if (!ids || ids.length === 0) return [];
    
    const { inArray } = await import('drizzle-orm');
    const rows = await this.db.select()
      .from(testimonials)
      .where(and(inArray(testimonials.id, ids), eq(testimonials.userId, userId)));
      
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
      position: props.position,
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
        position: props.position,
        metadata: props.metadata,
        updatedAt: props.updatedAt,
      })
      .where(eq(testimonials.id, props.id));
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

  async findByFormId(formId: string, options?: { limit?: number; offset?: number; sort?: string; order?: 'asc' | 'desc' }): Promise<Testimonial[]> {
    const { asc, desc } = await import('drizzle-orm');
    
    const query = this.db.select()
      .from(testimonials)
      .where(eq(testimonials.formId, formId));

    // Handle dynamic sorting
    const sortField = options?.sort;
    const sortOrder = options?.order || 'desc';
    
    const allowedSortFields = ['createdAt', 'rating', 'position', 'status', 'authorName'];
    
    if (sortField && allowedSortFields.includes(sortField)) {
      const column = (testimonials as Record<string, any>)[sortField];
      query.orderBy(sortOrder === 'desc' ? desc(column) : asc(column));
    } else {
      // Default order: position ASC (manual order), then createdAt DESC (newest first)
      query.orderBy(asc(testimonials.position), desc(testimonials.createdAt));
    }

    if (options?.limit) query.limit(options.limit);
    if (options?.offset) query.offset(options.offset);

    const rows = await query;
    return rows.map(row => this.mapToDomain(row));
  }

  async batchUpdateStatus(ids: string[], status: 'approved' | 'rejected' | 'pending'): Promise<void> {
    const { inArray } = await import('drizzle-orm');
    await this.db.update(testimonials)
      .set({ status, updatedAt: new Date() })
      .where(inArray(testimonials.id, ids));
  }


  async updatePositions(positions: { id: string; position: number }[]): Promise<void> {
    if (positions.length === 0) return;

    const ids = positions.map(p => p.id);
    const sqlChunks: SQL[] = [];
    sqlChunks.push(sql`(case`);
    
    for (const { id, position } of positions) {
      sqlChunks.push(sql`when ${testimonials.id} = ${id} then ${position}::integer`);
    }
    
    sqlChunks.push(sql`end)`);

    const finalSql = sql.join(sqlChunks, sql.raw(' '));

    const { inArray } = await import('drizzle-orm');
    
    await this.db.update(testimonials)
      .set({ 
        position: finalSql, 
        updatedAt: new Date() 
      })
      .where(inArray(testimonials.id, ids));
  }

  async getStatsByUser(userId: string): Promise<{
    totalReviews: number;
    averageRating: number;
    uniqueRespondents: number;
    reviewsGrowth?: number;
    completionRate?: number;
    completionGrowth?: number;
  }> {
    const [result] = await this.db.select({
      totalReviews: count(testimonials.id),
      averageRating: avg(testimonials.rating),
      uniqueRespondents: countDistinct(testimonials.authorEmail),
    })
    .from(testimonials)
    .where(eq(testimonials.userId, userId));

    const totalReviews = Number(result?.totalReviews || 0);

    // 1. Reviews Growth (Current 30 days vs Prev 30 days)
    const [current30] = await this.db.select({ count: count(testimonials.id) })
      .from(testimonials)
      .where(and(
        eq(testimonials.userId, userId),
        sql`${testimonials.createdAt} >= NOW() - INTERVAL '30 days'`
      ));
    
    const [prev30] = await this.db.select({ count: count(testimonials.id) })
      .from(testimonials)
      .where(and(
        eq(testimonials.userId, userId),
        sql`${testimonials.createdAt} >= NOW() - INTERVAL '60 days'`,
        sql`${testimonials.createdAt} < NOW() - INTERVAL '30 days'`
      ));

    const current30Count = Number(current30?.count || 0);
    const prev30Count = Number(prev30?.count || 0);
    
    let reviewsGrowth = 0;
    if (prev30Count === 0) {
      reviewsGrowth = current30Count > 0 ? 100 : 0;
    } else {
      reviewsGrowth = Math.round(((current30Count - prev30Count) / prev30Count) * 100);
    }

    // 2. Completion Rate and Growth
    const { formVisits, forms } = await import('../database/schema');
    
    const [visitsBasic] = await this.db.select({ totalVisits: sql<number>`sum(${formVisits.visits})` })
      .from(formVisits)
      .innerJoin(forms, eq(formVisits.formId, forms.id))
      .where(eq(forms.userId, userId));
      
    const totalVisits = Number(visitsBasic?.totalVisits || 0);
    const completionRate = totalVisits > 0 ? Math.round((totalReviews / totalVisits) * 100) : 100;

    const [current30VisitsResult] = await this.db.select({ count: sql<number>`sum(${formVisits.visits})` })
      .from(formVisits)
      .innerJoin(forms, eq(formVisits.formId, forms.id))
      .where(and(
        eq(forms.userId, userId),
        sql`${formVisits.date} >= NOW() - INTERVAL '30 days'`
      ));
      
    const [prev30VisitsResult] = await this.db.select({ count: sql<number>`sum(${formVisits.visits})` })
      .from(formVisits)
      .innerJoin(forms, eq(formVisits.formId, forms.id))
      .where(and(
        eq(forms.userId, userId),
        sql`${formVisits.date} >= NOW() - INTERVAL '60 days'`,
        sql`${formVisits.date} < NOW() - INTERVAL '30 days'`
      ));
      
    const current30Visits = Number(current30VisitsResult?.count || 0);
    const prev30Visits = Number(prev30VisitsResult?.count || 0);
    
    const current30Rate = current30Visits > 0 ? (current30Count / current30Visits) * 100 : (current30Count > 0 ? 100 : 0);
    const prev30Rate = prev30Visits > 0 ? (prev30Count / prev30Visits) * 100 : (prev30Count > 0 ? 100 : 0);
    const completionGrowth = Math.round(current30Rate - prev30Rate);

    return {
      totalReviews: totalReviews,
      averageRating: Number(result?.averageRating || 0),
      uniqueRespondents: Number(result?.uniqueRespondents || 0),
      reviewsGrowth,
      completionRate,
      completionGrowth,
    };
  }

  async getBasicStatsByFormIds(formIds: string[]): Promise<Map<string, { totalReviews: number; averageRating: number }>> {
    const statsMap = new Map<string, { totalReviews: number; averageRating: number }>();
    if (!formIds || formIds.length === 0) return statsMap;

    const { inArray } = await import('drizzle-orm');
    
    const rows = await this.db.select({
      formId: testimonials.formId,
      totalReviews: count(testimonials.id),
      averageRating: avg(testimonials.rating),
    })
    .from(testimonials)
    .where(inArray(testimonials.formId, formIds))
    .groupBy(testimonials.formId);

    for (const row of rows) {
      if (row.formId) {
        statsMap.set(row.formId, {
          totalReviews: Number(row.totalReviews) || 0,
          averageRating: Number(row.averageRating) || 0,
        });
      }
    }

    return statsMap;
  }

  async getStatsByFormId(formId: string): Promise<{
    totalReviews: number;
    averageRating: number;
    uniqueRespondents: number;
    ratingDistribution: { rating: number; count: number }[];
    reviewVolume: { label: string; value: number }[];
    reviewsGrowth?: number;
    completionRate?: number;
    completionGrowth?: number;
  }> {
    // Basic stats
    const [basicStats] = await this.db.select({
      totalReviews: count(testimonials.id),
      averageRating: avg(testimonials.rating),
      uniqueRespondents: countDistinct(testimonials.authorEmail),
    })
    .from(testimonials)
    .where(eq(testimonials.formId, formId));

    // Rating distribution
    const distributionRows = await this.db.select({
      rating: testimonials.rating,
      count: count(testimonials.id),
    })
    .from(testimonials)
    .where(eq(testimonials.formId, formId))
    .groupBy(testimonials.rating);

    const ratingDistribution = Array.from({ length: 5 }, (_, i) => ({
      rating: 5 - i,
      count: Number(distributionRows.find(r => r.rating === (5 - i))?.count) || 0,
    }));

    // Review volume (Daily - Last 14 days)
    const volumeRows = await this.db.select({
      day: sql`date_trunc('day', ${testimonials.createdAt})`.as('day'),
      count: count(testimonials.id),
    })
    .from(testimonials)
    .where(and(
      eq(testimonials.formId, formId),
      sql`${testimonials.createdAt} >= NOW() - INTERVAL '14 days'`
    ))
    .groupBy(sql`day`)
    .orderBy(sql`day ASC`);

    // Zero-filling: Ensure we have the last 14 days exactly
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (13 - i));
      return d;
    });

    const reviewVolume = last14Days.map(date => {
      const row = volumeRows.find(r => {
        const rowDate = new Date(r.day as string);
        rowDate.setHours(0, 0, 0, 0);
        return rowDate.getTime() === date.getTime();
      });

      return {
        label: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        value: Number(row?.count) || 0,
      };
    });

    // Dynamic Growth Metrics
    
    // 1. Reviews Growth (Current 30 days vs Prev 30 days)
    const [current30] = await this.db.select({ count: count(testimonials.id) })
      .from(testimonials)
      .where(and(
        eq(testimonials.formId, formId),
        sql`${testimonials.createdAt} >= NOW() - INTERVAL '30 days'`
      ));
    
    const [prev30] = await this.db.select({ count: count(testimonials.id) })
      .from(testimonials)
      .where(and(
        eq(testimonials.formId, formId),
        sql`${testimonials.createdAt} >= NOW() - INTERVAL '60 days'`,
        sql`${testimonials.createdAt} < NOW() - INTERVAL '30 days'`
      ));
      
    const current30Count = Number(current30?.count || 0);
    const prev30Count = Number(prev30?.count || 0);
    
    let reviewsGrowth = 0;
    if (prev30Count === 0) {
      reviewsGrowth = current30Count > 0 ? 100 : 0;
    } else {
      reviewsGrowth = Math.round(((current30Count - prev30Count) / prev30Count) * 100);
    }

    // 2. Completion Rate and Growth
    const { formVisits } = await import('../database/schema');
    
    const [visitsBasic] = await this.db.select({ totalVisits: sql<number>`sum(${formVisits.visits})` })
      .from(formVisits)
      .where(eq(formVisits.formId, formId));
      
    const totalVisits = Number(visitsBasic?.totalVisits || 0);
    const totalReviews = Number(basicStats?.totalReviews || 0);
    const completionRate = totalVisits > 0 ? Math.round((totalReviews / totalVisits) * 100) : 100;

    const [current30VisitsResult] = await this.db.select({ count: sql<number>`sum(${formVisits.visits})` })
      .from(formVisits)
      .where(and(
        eq(formVisits.formId, formId),
        sql`${formVisits.date} >= NOW() - INTERVAL '30 days'`
      ));
      
    const [prev30VisitsResult] = await this.db.select({ count: sql<number>`sum(${formVisits.visits})` })
      .from(formVisits)
      .where(and(
        eq(formVisits.formId, formId),
        sql`${formVisits.date} >= NOW() - INTERVAL '60 days'`,
        sql`${formVisits.date} < NOW() - INTERVAL '30 days'`
      ));
      
    const current30Visits = Number(current30VisitsResult?.count || 0);
    const prev30Visits = Number(prev30VisitsResult?.count || 0);
    
    const current30Rate = current30Visits > 0 ? (current30Count / current30Visits) * 100 : (current30Count > 0 ? 100 : 0);
    const prev30Rate = prev30Visits > 0 ? (prev30Count / prev30Visits) * 100 : (prev30Count > 0 ? 100 : 0);
    const completionGrowth = Math.round(current30Rate - prev30Rate);

    return {
      totalReviews: Number(basicStats?.totalReviews) || 0,
      averageRating: Number(basicStats?.averageRating) || 0,
      uniqueRespondents: Number(basicStats?.uniqueRespondents) || 0,
      ratingDistribution,
      reviewVolume,
      reviewsGrowth,
      completionRate,
      completionGrowth,
    };
  }

  private mapToDomain(row: typeof testimonials.$inferSelect): Testimonial {
    return new Testimonial({
      id: row.id,
      userId: row.userId,
      content: row.content,
      authorName: row.authorName,
      status: row.status as 'approved' | 'rejected' | 'pending',
      source: row.source as 'form' | 'import' | 'api',
      rating: row.rating ? Rating.create(row.rating) : undefined,
      authorEmail: row.authorEmail ? Email.create(row.authorEmail) : undefined,
      authorTitle: row.authorTitle || undefined,
      authorUrl: row.authorUrl || undefined,
      formId: row.formId || undefined,
      mediaId: row.mediaId || undefined,
      position: row.position || 0,
      metadata: row.metadata as any,
      createdAt: row.createdAt || undefined,
      updatedAt: row.updatedAt || undefined,
    });
  }
}
