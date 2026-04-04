import { NotFoundError } from '../../../domain/errors/NotFoundError';
import type { ITestimonialRepository } from '../../../domain/repositories/ITestimonialRepository';
import type { IFormRepository } from '../../../domain/repositories/IFormRepository';
import type { Testimonial } from '../../../domain/entities/Testimonial';

interface ExportTestimonialsRequest {
  userId: string;
  formId: string;
}

export class ExportTestimonialsUseCase {
  constructor(
    private readonly testimonialRepository: ITestimonialRepository,
    private readonly formRepository: IFormRepository
  ) {}

  async execute(request: ExportTestimonialsRequest) {
    const { userId, formId } = request;

    // Verify form belongs to user
    const form = await this.formRepository.findById(formId);
    if (!form || form.getProps().userId !== userId) {
      throw new NotFoundError('Form not found or unauthorized');
    }

    const testimonials = await this.testimonialRepository.findByFormId(formId);

    // Map to plain objects for CSV conversion
    return testimonials.map((t: Testimonial) => {
      const props = t.getProps();
      return {
        authorName: props.authorName,
        authorEmail: props.authorEmail?.getValue() || '',
        rating: props.rating?.getValue() || 0,
        content: props.content,
        status: props.status,
        source: props.source,
        createdAt: props.createdAt?.toISOString() || '',
      };
    });
  }
}
