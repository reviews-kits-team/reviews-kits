import { randomUUID } from 'node:crypto';
import type { ITestimonialRepository } from '../../../domain/repositories/ITestimonialRepository';
import type { IFormRepository } from '../../../domain/repositories/IFormRepository';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import type { IEmailService } from '../../../domain/services/IEmailService';
import type { INotificationRepository } from '../../../domain/repositories/INotificationRepository';
import { Testimonial } from '../../../domain/entities/Testimonial';
import { Notification } from '../../../domain/entities/Notification';
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
  authorPhotoUrl?: string;
  videoUrl?: string;
  metadata?: Record<string, unknown>;
  consentPublic?: boolean;
  consentInternal?: boolean;
}

export class SubmitReviewUseCase {
  constructor(
    private readonly testimonialRepository: ITestimonialRepository,
    private readonly formRepository: IFormRepository,
    private readonly webhookService: WebhookService,
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService | null,
    private readonly notificationRepository: INotificationRepository
  ) {}

  async execute(request: SubmitReviewRequest): Promise<string> {
    const { formId, content, authorName, authorEmail, rating, authorTitle, authorUrl, authorPhotoUrl, videoUrl, metadata, consentPublic, consentInternal } = request;

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
      authorPhotoUrl: (authorPhotoUrl && authorPhotoUrl !== '') ? authorPhotoUrl : undefined,
      videoUrl: (videoUrl && videoUrl !== '') ? videoUrl : undefined,
      status: 'pending',
      source: 'form',
      metadata: metadata && Object.keys(metadata).length > 0 ? metadata : undefined,
      consentPublic: consentPublic ?? false,
      consentInternal: consentInternal ?? false,
      consentedAt: (consentPublic || consentInternal) ? new Date() : undefined,
    });

    await this.testimonialRepository.save(testimonial);

    const tProps = testimonial.getProps();

    // Trigger webhook asynchronously
    this.webhookService.trigger('testimonial.created', form.getUserId(), {
      id: testimonial.getId(),
      formId: form.getId(),
      content: tProps.content,
      authorName: tProps.authorName,
      authorEmail: tProps.authorEmail?.getValue(),
      rating: tProps.rating?.getValue(),
      createdAt: tProps.createdAt
    }).catch(err => { throw new Error(`Webhook trigger failed: ${err.message}`); });

    // Save in-app notification asynchronously
    this.notificationRepository.save(new Notification({
      id: randomUUID(),
      userId: form.getUserId(),
      type: 'new_review',
      title: `New review from ${authorName}`,
      body: content.length > 120 ? content.slice(0, 120) + '...' : content,
      formId: form.getId(),
      testimonialId: testimonial.getId(),
      isRead: false,
    })).catch(err => { throw new Error(`Notification save failed: ${err.message}`); });

    // Send email notification asynchronously
    if (this.emailService) {
      this.userRepository.findById(form.getUserId()).then(owner => {
        if (!owner) return;
        if (!owner.getNotificationPrefs().newReview) return;
        return this.emailService!.sendNewReviewNotification({
          ownerEmail: owner.getEmail(),
          formName: form.getName(),
          formId: form.getId(),
          authorName,
          rating: tProps.rating?.getValue(),
          content,
        });
      }).catch(err => { throw new Error(`Email notification failed: ${err.message}`); });
    }

    return testimonial.getId();
  }
}
