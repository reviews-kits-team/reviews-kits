import type { ITestimonialRepository } from '../../../domain/repositories/ITestimonialRepository';

export interface BatchUpdateTestimonialStatusRequest {
  ids: string[];
  userId: string;
  status: 'approved' | 'rejected' | 'pending';
}

export class BatchUpdateTestimonialStatusUseCase {
  constructor(private readonly testimonialRepository: ITestimonialRepository) {}

  async execute(request: BatchUpdateTestimonialStatusRequest): Promise<void> {
    const { ids, userId, status } = request;

    const owned = await this.testimonialRepository.findByIdsAndUser(ids, userId);
    if (owned.length !== ids.length) {
      throw new Error('Forbidden: one or more testimonials do not belong to you');
    }

    await this.testimonialRepository.batchUpdateStatus(ids, status);
  }
}
