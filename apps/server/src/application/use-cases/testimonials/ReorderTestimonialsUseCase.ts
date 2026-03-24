import type { ITestimonialRepository } from '../../../domain/repositories/ITestimonialRepository';

export interface ReorderTestimonialsRequest {
  userId: string;
  positions: { id: string; position: number }[];
}

export class ReorderTestimonialsUseCase {
  constructor(private readonly testimonialRepository: ITestimonialRepository) {}

  async execute(request: ReorderTestimonialsRequest): Promise<void> {
    const { userId, positions } = request;

    if (!Array.isArray(positions)) {
      throw new Error('Invalid data');
    }

    const ids = positions.map((p) => p.id);
    const owned = await this.testimonialRepository.findByIdsAndUser(ids, userId);
    if (owned.length !== ids.length) {
      throw new Error('Forbidden: one or more testimonials do not belong to you');
    }

    await this.testimonialRepository.updatePositions(positions);
  }
}
