import { NotFoundError } from '../../../domain/errors/NotFoundError';
import type { IFormRepository } from '../../../domain/repositories/IFormRepository';
import { Form } from '../../../domain/entities/Form';

export interface UpdateFormRequest {
  id: string;
  userId: string;
  name?: string;
  description?: string;
  config?: Record<string, unknown>;
  isActive?: boolean;
}

export class UpdateFormUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  async execute(request: UpdateFormRequest): Promise<Form> {
    const { id, userId, name, description, config, isActive } = request;

    const form = await this.formRepository.findById(id);
    if (!form || form.getUserId() !== userId) {
      throw new NotFoundError('Form not found');
    }

    if (name) form.updateName(name);
    if (description !== undefined) form.updateDescription(description);
    if (config) form.updateConfig(config);
    if (isActive !== undefined) form.updateIsActive(isActive);

    await this.formRepository.update(form);
    return form;
  }
}
