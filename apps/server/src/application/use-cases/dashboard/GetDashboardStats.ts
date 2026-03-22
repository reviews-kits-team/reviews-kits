import type { TestimonialRepository } from '../../../domain/repositories/TestimonialRepository';

export interface DashboardStats {
  totalReviews: number;
  averageRating: number;
  uniqueRespondents: number;
  completionRate: number;
  reviewsGrowth?: number;
  completionGrowth?: number;
}

export class GetDashboardStats {
  constructor(private readonly testimonialRepository: TestimonialRepository) {}

  async execute(userId: string): Promise<DashboardStats> {
    const stats = await this.testimonialRepository.getStatsByUser(userId);
    
    return {
      totalReviews: stats.totalReviews,
      averageRating: Number(stats.averageRating.toFixed(1)),
      uniqueRespondents: stats.uniqueRespondents,
      completionRate: stats.completionRate || 0,
      reviewsGrowth: stats.reviewsGrowth,
      completionGrowth: stats.completionGrowth,
    };
  }
}
