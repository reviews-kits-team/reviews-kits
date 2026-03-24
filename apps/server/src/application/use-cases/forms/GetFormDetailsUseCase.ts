import type { IFormRepository } from '../../../domain/repositories/IFormRepository';
import type { ITestimonialRepository } from '../../../domain/repositories/ITestimonialRepository';

export interface GetFormDetailsRequest {
  id: string;
  userId: string;
}

export class GetFormDetailsUseCase {
  constructor(
    private readonly formRepository: IFormRepository,
    private readonly testimonialRepository: ITestimonialRepository
  ) {}

  async execute(request: GetFormDetailsRequest) {
    const { id, userId } = request;

    const form = await this.formRepository.findById(id);
    if (!form || form.getUserId() !== userId) {
      throw new Error('Form not found');
    }

    const props = form.getProps();
    const [stats, visitsMap] = await Promise.all([
      this.testimonialRepository.getStatsByFormId(props.id),
      this.formRepository.getVisitsByFormIds([props.id])
    ]);
    
    const visits = visitsMap.get(props.id) || 0;
    let completion = 0;
    if (visits > 0) {
      completion = Math.min(100, Math.round((stats.totalReviews / visits) * 100));
    }

    return { 
      ...props, 
      slug: props.slug.getValue(),
      responses: stats.totalReviews,
      rating: stats.averageRating,
      completion
    };
  }
}
