import { createHmac } from 'node:crypto';
import type { IWebhookRepository } from '../../domain/repositories/IWebhookRepository';
import type { Webhook } from '../../domain/entities/Webhook';

export class WebhookService {
  constructor(private readonly webhookRepository: IWebhookRepository) {}

  async trigger(event: string, userId: string, data: any): Promise<void> {
    const webhooks = await this.webhookRepository.findByUser(userId);
    const activeWebhooks = webhooks.filter(w => w.isActive() && w.hasEvent(event));

    if (activeWebhooks.length === 0) return;

    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    // Fire and forget (don't await the actual fetch to not block the caller)
    activeWebhooks.forEach(webhook => {
      this.sendWebhook(webhook, payload).catch(err => {
        console.error(`Failed to send webhook ${webhook.getId()}:`, err);
      });
    });
  }

  private async sendWebhook(webhook: Webhook, payload: any): Promise<void> {
    const body = JSON.stringify(payload);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-ReviewKits-Event': payload.event,
      'User-Agent': 'ReviewKits-Webhook/1.0',
    };

    if (webhook.getSecret()) {
      const signature = createHmac('sha256', webhook.getSecret())
        .update(body)
        .digest('hex');
      headers['X-ReviewKits-Signature'] = signature;
    }

    try {
      const response = await fetch(webhook.getUrl(), {
        method: 'POST',
        headers,
        body,
      });

      const responseBody = await response.text();

      await this.webhookRepository.logWebhookCall({
        webhookId: webhook.getId(),
        event: payload.event,
        payload,
        responseStatus: response.status,
        responseBody: responseBody.substring(0, 1000), // Limit log size
        delivered: response.ok,
      });
    } catch (err: any) {
      await this.webhookRepository.logWebhookCall({
        webhookId: webhook.getId(),
        event: payload.event,
        payload,
        responseBody: err.message,
        delivered: false,
      });
      throw err;
    }
  }
}
