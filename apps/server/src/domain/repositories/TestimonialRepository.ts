import { Testimonial } from '../entities/Testimonial';

export interface TestimonialRepository {
  findById(id: string): Promise<Testimonial | null>;
  findByUser(userId: string, filters?: any): Promise<Testimonial[]>;
  save(testimonial: Testimonial): Promise<void>;
  update(testimonial: Testimonial): Promise<void>;
  delete(id: string): Promise<void>;
  findApprovedByUser(userId: string, options: { limit?: number; minRating?: number; formId: string }): Promise<Testimonial[]>;
  findByFormId(formId: string, options?: { limit?: number; offset?: number; sort?: string; order?: 'asc' | 'desc' }): Promise<Testimonial[]>;
  batchUpdateStatus(ids: string[], status: 'approved' | 'rejected' | 'pending'): Promise<void>;
  batchDelete(ids: string[]): Promise<void>;
  updatePositions(positions: { id: string; position: number }[]): Promise<void>;
  getStatsByUser(userId: string): Promise<{
    totalReviews: number;
    averageRating: number;
    uniqueRespondents: number;
    reviewsGrowth?: number;
    completionRate?: number;
    completionGrowth?: number;
  }>;
  getStatsByFormId(formId: string): Promise<{
    totalReviews: number;
    averageRating: number;
    uniqueRespondents: number;
    ratingDistribution: { rating: number; count: number }[];
    reviewVolume: { label: string; value: number }[];
    reviewsGrowth?: number;
    completionRate?: number;
    completionGrowth?: number;
  }>;
}
