import type { IWebhookRepository } from '../../../domain/repositories/IWebhookRepository';
import type { WebhookService } from '../../services/WebhookService';
import { NotFoundError } from '../../../domain/errors/NotFoundError';

export interface TestWebhookRequest {
  id: string;
  userId: string;
  payload: Record<string, unknown>;
}

export class TestWebhookUseCase {
  constructor(
    private readonly webhookRepository: IWebhookRepository,
    private readonly webhookService: WebhookService,
  ) {}

  async execute(request: TestWebhookRequest): Promise<void> {
    const { id, userId, payload } = request;
    const webhook = await this.webhookRepository.findById(id);

    if (!webhook || webhook.getUserId() !== userId) {
      throw new NotFoundError('Webhook');
    }

    await this.webhookService.trigger('testimonial.created', userId, payload);
  }
}
