import type { IWebhookRepository } from '../../../domain/repositories/IWebhookRepository';
import { NotFoundError } from '../../../domain/errors/NotFoundError';

export interface DeleteWebhookRequest {
  id: string;
  userId: string;
}

export class DeleteWebhookUseCase {
  constructor(private readonly webhookRepository: IWebhookRepository) {}

  async execute(request: DeleteWebhookRequest): Promise<void> {
    const { id, userId } = request;
    const webhook = await this.webhookRepository.findById(id);

    if (!webhook || webhook.getUserId() !== userId) {
      throw new NotFoundError('Webhook');
    }

    await this.webhookRepository.delete(id);
  }
}
