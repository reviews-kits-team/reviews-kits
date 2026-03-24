import { Webhook } from '../entities/Webhook';

export interface IWebhookRepository {
  findById(id: string): Promise<Webhook | null>;
  findByUser(userId: string): Promise<Webhook[]>;
  findByEvent(event: string): Promise<Webhook[]>;
  save(webhook: Webhook): Promise<void>;
  update(webhook: Webhook): Promise<void>;
  delete(id: string): Promise<void>;
  logWebhookCall(log: {
    webhookId: string;
    event: string;
    payload: any;
    responseStatus?: number;
    responseBody?: string;
    delivered: boolean;
  }): Promise<void>;
}
