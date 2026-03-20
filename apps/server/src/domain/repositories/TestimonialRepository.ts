import { Testimonial } from '../entities/Testimonial';

export interface TestimonialRepository {
  findById(id: string): Promise<Testimonial | null>;
  findByUser(userId: string, filters?: any): Promise<Testimonial[]>;
  save(testimonial: Testimonial): Promise<void>;
  update(testimonial: Testimonial): Promise<void>;
  delete(id: string): Promise<void>;
}
