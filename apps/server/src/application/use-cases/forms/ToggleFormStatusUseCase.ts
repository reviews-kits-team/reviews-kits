import type { IFormRepository } from '../../../domain/repositories/IFormRepository';
import { Form } from '../../../domain/entities/Form';

export interface ToggleFormStatusRequest {
  id: string;
  userId: string;
}

export class ToggleFormStatusUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  async execute(request: ToggleFormStatusRequest): Promise<Form> {
    const { id, userId } = request;

    const form = await this.formRepository.findById(id);
    if (!form || form.getUserId() !== userId) {
      throw new Error('Form not found');
    }

    form.toggleActive();
    await this.formRepository.update(form);
    return form;
  }
}
