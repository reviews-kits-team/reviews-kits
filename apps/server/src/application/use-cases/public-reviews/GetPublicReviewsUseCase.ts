import { NotFoundError } from '../../../domain/errors/NotFoundError';
import type { ITestimonialRepository } from '../../../domain/repositories/ITestimonialRepository';
import type { IFormRepository } from '../../../domain/repositories/IFormRepository';

export interface GetPublicReviewsRequest {
  userId: string;
  publicId: string;
  limit: number;
  minRating?: number;
}

export class GetPublicReviewsUseCase {
  constructor(
    private readonly testimonialRepository: ITestimonialRepository,
    private readonly formRepository: IFormRepository
  ) {}

  async execute(request: GetPublicReviewsRequest) {
    const { userId, publicId, limit, minRating } = request;

    const form = await this.formRepository.findByPublicId(publicId);
    if (!form || form.getUserId() !== userId) {
      throw new NotFoundError('Form not found or invalid public ID');
    }

    const testimonials = await this.testimonialRepository.findApprovedByUser(userId, {
      limit: Math.min(limit, 50),
      minRating: minRating,
      formId: form.getId()
    });

    return testimonials.map(t => {
      const props = t.getProps();
      return {
        id: props.id,
        content: props.content,
        rating: props.rating?.getValue(),
        authorName: props.authorName,
        authorTitle: props.authorTitle,
        authorUrl: props.authorUrl,
        createdAt: props.createdAt,
        source: props.source
      };
    });
  }
}
