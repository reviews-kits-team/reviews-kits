import { NotFoundError } from '../../../domain/errors/NotFoundError';
import type { IFormRepository } from '../../../domain/repositories/IFormRepository';
import type { ITestimonialRepository } from '../../../domain/repositories/ITestimonialRepository';

export interface GetFormTestimonialsRequest {
  id: string;
  userId: string;
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
  consentPublic?: boolean;
}

export class GetFormTestimonialsUseCase {
  constructor(
    private readonly formRepository: IFormRepository,
    private readonly testimonialRepository: ITestimonialRepository
  ) {}

  async execute(request: GetFormTestimonialsRequest) {
    const { id, userId, page, limit, sort, order } = request;

    const form = await this.formRepository.findById(id);
    if (!form || form.getUserId() !== userId) {
      throw new NotFoundError('Form not found');
    }

    const offset = (page - 1) * limit;
    const testimonials = await this.testimonialRepository.findByFormId(id, { 
      limit, 
      offset, 
      sort, 
      order,
      consentPublic: request.consentPublic
    });

    return testimonials.map(t => {
      const props = t.getProps();
      return {
        ...props,
        rating: props.rating?.getValue(),
        authorEmail: props.authorEmail?.getValue()
      };
    });
  }
}
