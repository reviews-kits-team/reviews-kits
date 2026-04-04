import { randomUUID } from 'node:crypto';
import type { IFormRepository } from '../../../domain/repositories/IFormRepository';
import { Form, type FormStep } from '../../../domain/entities/Form';
import { Slug } from '../../../domain/value-objects/Slug';
import { ApiKeyGenerator } from '../../../shared/utils/ApiKeyGenerator';

export interface CreateFormRequest {
  userId: string;
  name: string;
  slug: string;
  description?: string;
}

const buildDefaultSteps = (): FormStep[] => [
  {
    id: randomUUID(),
    type: 'welcome',
    title: 'Share your experience',
    description: "We'd love to hear what you think about our product or service.",
    isEnabled: true,
    locked: true,
    config: { buttonText: 'Get started' }
  },
  {
    id: randomUUID(),
    type: 'core',
    title: 'How would you rate us?',
    description: 'On a scale of 1 to 5, how would you rate our service?',
    isEnabled: true,
    locked: true,
    config: { ratingType: 'stars', placeholder: 'Tell us more about your experience...', buttonText: 'Continue' }
  },
  {
    id: randomUUID(),
    type: 'identity',
    title: 'About you',
    description: 'This information will be displayed with your testimonial.',
    isEnabled: true,
    locked: true,
    config: { collectEmail: true, collectCompany: false, collectSocialLinks: false, buttonText: 'Submit' }
  },
  {
    id: randomUUID(),
    type: 'success',
    title: 'Thank you!',
    description: 'Your testimonial has been submitted successfully.',
    isEnabled: true,
    locked: true,
    config: {}
  }
];

export class CreateFormUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  async execute(request: CreateFormRequest): Promise<Form> {
    const { userId, name, slug, description } = request;

    if (!name || !slug) {
      throw new Error('Name and Slug are required');
    }

    const form = new Form({
      id: randomUUID(),
      userId,
      name,
      slug: Slug.create(slug),
      publicId: ApiKeyGenerator.generatePublicId('frm'),
      description,
      isActive: true,
      config: {
        steps: buildDefaultSteps(),
      }
    });

    await this.formRepository.save(form);
    return form;
  }
}
