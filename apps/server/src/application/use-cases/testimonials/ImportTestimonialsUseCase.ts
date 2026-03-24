import { Testimonial } from '../../../domain/entities/Testimonial';
import { Rating } from '../../../domain/value-objects/Rating';
import { Email } from '../../../domain/value-objects/Email';
import type { ITestimonialRepository } from '../../../domain/repositories/ITestimonialRepository';
import type { IFormRepository } from '../../../domain/repositories/IFormRepository';

interface ImportTestimonialsRequest {
  userId: string;
  formId: string;
  data: {
    authorName: string;
    authorEmail?: string;
    rating: number;
    content: string;
    createdAt?: string;
  }[];
}

export class ImportTestimonialsUseCase {
  constructor(
    private readonly testimonialRepository: ITestimonialRepository,
    private readonly formRepository: IFormRepository
  ) {}

  async execute(request: ImportTestimonialsRequest) {
    const { userId, formId, data } = request;

    // Verify form belongs to user
    const form = await this.formRepository.findById(formId);
    if (!form || form.getProps().userId !== userId) {
      throw new Error('Form not found or unauthorized');
    }

    const newTestimonials = data.map(item => {
      return new Testimonial({
        id: crypto.randomUUID(),
        userId,
        formId,
        authorName: item.authorName || 'Anonymous',
        authorEmail: item.authorEmail ? Email.create(item.authorEmail) : undefined,
        rating: Rating.create(item.rating || 5),
        content: item.content || '',
        status: 'approved', // Auto-approve imported reviews by default?
        source: 'import',
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      });
    });

    await this.testimonialRepository.batchSave(newTestimonials);

    return { importedCount: newTestimonials.length };
  }
}
