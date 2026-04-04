import { randomBytes, randomUUID } from 'node:crypto';
import { Webhook } from '../../../domain/entities/Webhook';
import type { IWebhookRepository } from '../../../domain/repositories/IWebhookRepository';

export interface CreateWebhookRequest {
  userId: string;
  url: string;
  events: string[];
}

export class CreateWebhookUseCase {
  constructor(private readonly webhookRepository: IWebhookRepository) {}

  async execute(request: CreateWebhookRequest): Promise<Webhook> {
    const { userId, url, events } = request;

    const webhook = new Webhook({
      id: randomUUID(),
      userId,
      url,
      events,
      secret: randomBytes(24).toString('hex'),
      isActive: true,
    });

    await this.webhookRepository.save(webhook);
    return webhook;
  }
}
