import type { IFormRepository } from '../../../domain/repositories/IFormRepository';

export interface BatchToggleFormStatusRequest {
  ids: string[];
  userId: string;
  isActive: boolean;
}

export class BatchToggleFormStatusUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  async execute(request: BatchToggleFormStatusRequest): Promise<void> {
    const { ids, userId, isActive } = request;

    const owned = await this.formRepository.findByIdsAndUser(ids, userId);
    if (owned.length !== ids.length) {
      throw new Error('Forbidden: one or more forms do not belong to you');
    }

    await this.formRepository.batchUpdateStatus(ids, isActive);
  }
}
