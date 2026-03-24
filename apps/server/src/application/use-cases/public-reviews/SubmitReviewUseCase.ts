import { randomUUID } from 'node:crypto';
import type { ITestimonialRepository } from '../../../domain/repositories/ITestimonialRepository';
import type { IFormRepository } from '../../../domain/repositories/IFormRepository';
import { Testimonial } from '../../../domain/entities/Testimonial';
import { Rating } from '../../../domain/value-objects/Rating';
import { Email } from '../../../domain/value-objects/Email';
import type { WebhookService } from '../../services/WebhookService';

export interface SubmitReviewRequest {
  formId: string;
  content: string;
  authorName: string;
  authorEmail?: string;
  rating?: string | number;
  authorTitle?: string;
  authorUrl?: string;
}

export class SubmitReviewUseCase {
  constructor(
    private readonly testimonialRepository: ITestimonialRepository,
    private readonly formRepository: IFormRepository,
    private readonly webhookService: WebhookService
  ) {}

  async execute(request: SubmitReviewRequest): Promise<string> {
    const { formId, content, authorName, authorEmail, rating, authorTitle, authorUrl } = request;

    const form = await this.formRepository.findByPublicId(formId);
    if (!form) {
      throw new Error('Invalid form ID');
    }

    const testimonial = new Testimonial({
      id: randomUUID(),
      userId: form.getUserId(),
      formId: form.getId(),
      content,
      authorName,
      rating: (rating !== undefined && rating !== null && rating !== '') ? Rating.create(Number(rating)) : undefined,
      authorEmail: (authorEmail && authorEmail !== '') ? Email.create(authorEmail) : undefined,
      authorTitle,
      authorUrl: (authorUrl && authorUrl !== '') ? authorUrl : undefined,
      status: 'pending',
      source: 'form'
    });

    await this.testimonialRepository.save(testimonial);

    // Trigger webhook asynchronously
    const tProps = testimonial.getProps();
    this.webhookService.trigger('testimonial.created', form.getUserId(), {
      id: testimonial.getId(),
      formId: form.getId(),
      content: tProps.content,
      authorName: tProps.authorName,
      authorEmail: tProps.authorEmail?.getValue(),
      rating: tProps.rating?.getValue(),
      createdAt: tProps.createdAt
    }).catch(err => console.error('Webhook trigger failed:', err));

    return testimonial.getId();
  }
}
