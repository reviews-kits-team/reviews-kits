import type { IFormRepository } from '../../../domain/repositories/IFormRepository';
import type { ITestimonialRepository } from '../../../domain/repositories/ITestimonialRepository';

export interface GetFormStatsRequest {
  id: string;
  userId: string;
}

export class GetFormStatsUseCase {
  constructor(
    private readonly formRepository: IFormRepository,
    private readonly testimonialRepository: ITestimonialRepository
  ) {}

  async execute(request: GetFormStatsRequest) {
    const { id, userId } = request;

    const form = await this.formRepository.findById(id);
    if (!form || form.getUserId() !== userId) {
      throw new Error('Form not found');
    }

    return this.testimonialRepository.getStatsByFormId(id);
  }
}
