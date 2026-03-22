import { Testimonial } from '../entities/Testimonial';

export interface TestimonialRepository {
  findById(id: string): Promise<Testimonial | null>;
  findByUser(userId: string, filters?: any): Promise<Testimonial[]>;
  save(testimonial: Testimonial): Promise<void>;
  update(testimonial: Testimonial): Promise<void>;
  delete(id: string): Promise<void>;
  findApprovedByUser(userId: string, options: { limit?: number; minRating?: number; formId: string }): Promise<Testimonial[]>;
  getStatsByUser(userId: string): Promise<{
    totalReviews: number;
    averageRating: number;
    uniqueRespondents: number;
  }>;
}
