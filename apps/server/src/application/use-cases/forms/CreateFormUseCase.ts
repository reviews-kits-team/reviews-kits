import { randomUUID } from 'node:crypto';
import type { IFormRepository } from '../../../domain/repositories/IFormRepository';
import { Form } from '../../../domain/entities/Form';
import { Slug } from '../../../domain/value-objects/Slug';
import { ApiKeyGenerator } from '../../../shared/utils/ApiKeyGenerator';

export interface CreateFormRequest {
  userId: string;
  name: string;
  slug: string;
  description?: string;
}

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
    });

    await this.formRepository.save(form);
    return form;
  }
}
