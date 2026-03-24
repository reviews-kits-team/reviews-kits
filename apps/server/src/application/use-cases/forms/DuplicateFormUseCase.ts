import { randomUUID } from 'node:crypto';
import type { IFormRepository } from '../../../domain/repositories/IFormRepository';
import { Form } from '../../../domain/entities/Form';
import { Slug } from '../../../domain/value-objects/Slug';
import { ApiKeyGenerator } from '../../../shared/utils/ApiKeyGenerator';

export interface DuplicateFormRequest {
  id: string;
  userId: string;
}

export class DuplicateFormUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  async execute(request: DuplicateFormRequest): Promise<Form> {
    const { id, userId } = request;

    const originalForm = await this.formRepository.findById(id);
    if (!originalForm || originalForm.getUserId() !== userId) {
      throw new Error('Form not found');
    }

    const originalProps = originalForm.getProps();
    const newSlugValue = `${originalProps.slug.getValue()}-copy-${Date.now().toString().slice(-4)}`;
    
    const newForm = new Form({
      id: randomUUID(),
      userId,
      name: `${originalProps.name} (Copie)`,
      slug: Slug.create(newSlugValue),
      publicId: ApiKeyGenerator.generatePublicId('frm'),
      description: originalProps.description,
      thankYouMessage: originalProps.thankYouMessage,
      config: originalProps.config,
      accentColor: originalProps.accentColor,
      isActive: originalProps.isActive,
    });

    await this.formRepository.save(newForm);
    return newForm;
  }
}
