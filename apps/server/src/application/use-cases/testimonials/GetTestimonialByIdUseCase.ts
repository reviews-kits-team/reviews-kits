import { NotFoundError } from '../../../domain/errors/NotFoundError';
import type { ITestimonialRepository } from '../../../domain/repositories/ITestimonialRepository';

export interface GetTestimonialByIdRequest {
  id: string;
  userId: string;
}

export class GetTestimonialByIdUseCase {
  constructor(private readonly testimonialRepository: ITestimonialRepository) {}

  async execute(request: GetTestimonialByIdRequest) {
    const { id, userId } = request;

    const testimonial = await this.testimonialRepository.findById(id);
    if (!testimonial || testimonial.getUserId() !== userId) {
      throw new NotFoundError('Testimonial not found');
    }

    const props = testimonial.getProps();
    return {
      id: props.id,
      content: props.content,
      authorName: props.authorName,
      authorEmail: props.authorEmail?.getValue(),
      authorTitle: props.authorTitle,
      authorUrl: props.authorUrl,
      rating: props.rating?.getValue(),
      status: props.status,
      source: props.source,
      formId: props.formId,
      metadata: props.metadata,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
