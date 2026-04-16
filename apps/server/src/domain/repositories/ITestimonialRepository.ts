import { Testimonial } from '../entities/Testimonial';

export interface TestimonialFilters {
  status?: 'approved' | 'rejected' | 'pending';
}

export interface ITestimonialRepository {
  findById(id: string): Promise<Testimonial | null>;
  findByUser(userId: string, filters?: TestimonialFilters): Promise<Testimonial[]>;
  findByIdsAndUser(ids: string[], userId: string): Promise<Testimonial[]>;
  save(testimonial: Testimonial): Promise<void>;
  batchSave(testimonials: Testimonial[]): Promise<void>;
  update(testimonial: Testimonial): Promise<void>;
  findApprovedByUser(userId: string, options: { limit?: number; minRating?: number; formId: string }): Promise<Testimonial[]>;
  findByFormId(formId: string, options?: { limit?: number; offset?: number; sort?: string; order?: 'asc' | 'desc'; consentPublic?: boolean }): Promise<Testimonial[]>;
  batchUpdateStatus(ids: string[], status: 'approved' | 'rejected' | 'pending'): Promise<void>;
  updatePositions(positions: { id: string; position: number }[]): Promise<void>;
  getStatsByUser(userId: string): Promise<{
    totalReviews: number;
    averageRating: number;
    uniqueRespondents: number;
    reviewsGrowth?: number;
    completionRate?: number;
    completionGrowth?: number;
  }>;
  getBasicStatsByFormIds(formIds: string[]): Promise<Map<string, { totalReviews: number; averageRating: number }>>;
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
