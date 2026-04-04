import { NotFoundError } from '../../../domain/errors/NotFoundError';
import type { ITestimonialRepository } from '../../../domain/repositories/ITestimonialRepository';

export interface UpdateTestimonialStatusRequest {
  id: string;
  userId: string;
  status: 'approved' | 'rejected' | 'pending';
}

export class UpdateTestimonialStatusUseCase {
  constructor(private readonly testimonialRepository: ITestimonialRepository) {}

  async execute(request: UpdateTestimonialStatusRequest): Promise<{ status: string }> {
    const { id, userId, status } = request;

    const testimonial = await this.testimonialRepository.findById(id);
    if (!testimonial || testimonial.getUserId() !== userId) {
      throw new NotFoundError('Testimonial not found');
    }

    if (status === 'approved') {
      testimonial.approve();
    } else if (status === 'rejected') {
      testimonial.reject();
    } else {
      throw new Error('Invalid status');
    }

    await this.testimonialRepository.update(testimonial);
    return { status: testimonial.getStatus() };
  }
}
