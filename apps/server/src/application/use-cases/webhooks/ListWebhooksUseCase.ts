import type { IWebhookRepository } from '../../../domain/repositories/IWebhookRepository';
import type { Webhook } from '../../../domain/entities/Webhook';

export class ListWebhooksUseCase {
  constructor(private readonly webhookRepository: IWebhookRepository) {}

  async execute(userId: string): Promise<Webhook[]> {
    return this.webhookRepository.findByUser(userId);
  }
}
