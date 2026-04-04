import { NotFoundError } from '../../../domain/errors/NotFoundError';
import type { IFormRepository } from '../../../domain/repositories/IFormRepository';

export interface DeleteFormRequest {
  id: string;
  userId: string;
}

export class DeleteFormUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  async execute(request: DeleteFormRequest): Promise<void> {
    const { id, userId } = request;

    const form = await this.formRepository.findById(id);
    if (!form || form.getUserId() !== userId) {
      throw new NotFoundError('Form not found');
    }

    await this.formRepository.delete(id);
  }
}
