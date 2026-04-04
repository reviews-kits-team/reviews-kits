import { NotFoundError } from '../../../domain/errors/NotFoundError';
import type { IFormRepository } from '../../../domain/repositories/IFormRepository';

export interface GetPublicFormRequest {
  slug: string;
}

export class GetPublicFormUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  async execute(request: GetPublicFormRequest) {
    const { slug } = request;

    let form = await this.formRepository.findBySlug(slug);
    
    // Fallback to publicId if slug doesn't match
    if (!form) {
      form = await this.formRepository.findByPublicId(slug);
    }

    if (!form) {
      throw new NotFoundError('Form not found');
    }

    if (!form.getIsActive()) {
      throw new Error('This form is currently inactive');
    }

    // Increment visits - non-blocking preferred but we follow current controller logic
    await this.formRepository.incrementVisits(form.getId()).catch(console.error);

    const props = form.getProps();
    return {
      id: props.id,
      publicId: props.publicId,
      name: props.name,
      description: props.description,
      config: props.config,
    };
  }
}
