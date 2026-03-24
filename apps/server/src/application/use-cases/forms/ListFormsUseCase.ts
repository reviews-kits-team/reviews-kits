import type { IFormRepository } from '../../../domain/repositories/IFormRepository';
import type { ITestimonialRepository } from '../../../domain/repositories/ITestimonialRepository';

export class ListFormsUseCase {
  constructor(
    private readonly formRepository: IFormRepository,
    private readonly testimonialRepository: ITestimonialRepository
  ) {}

  async execute(userId: string) {
    const forms = await this.formRepository.findByUser(userId);
    const formIds = forms.map(f => f.getProps().id);
    
    if (formIds.length === 0) return [];

    const [statsMap, visitsMap] = await Promise.all([
      this.testimonialRepository.getBasicStatsByFormIds(formIds),
      this.formRepository.getVisitsByFormIds(formIds)
    ]);

    return forms.map(f => {
      const props = f.getProps();
      const stats = statsMap.get(props.id) || { totalReviews: 0, averageRating: 0 };
      const visits = visitsMap.get(props.id) || 0;
      
      let completion = 0;
      if (visits > 0) {
        completion = Math.min(100, Math.round((stats.totalReviews / visits) * 100));
      }

      return { 
        ...props, 
        slug: props.slug.getValue(),
        publicId: props.publicId,
        responses: stats.totalReviews,
        rating: stats.averageRating,
        completion
      };
    });
  }
}
