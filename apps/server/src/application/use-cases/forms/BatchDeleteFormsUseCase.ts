import type { IFormRepository } from '../../../domain/repositories/IFormRepository';

export interface BatchDeleteFormsRequest {
  ids: string[];
  userId: string;
}

export class BatchDeleteFormsUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  async execute(request: BatchDeleteFormsRequest): Promise<void> {
    const { ids, userId } = request;

    const owned = await this.formRepository.findByIdsAndUser(ids, userId);
    if (owned.length !== ids.length) {
      throw new Error('Forbidden: one or more forms do not belong to you');
    }

    await this.formRepository.batchDelete(ids);
  }
}
