import { randomUUID } from 'node:crypto';
import type { Context } from 'hono';
import { container } from '@/infrastructure/container';
import { getUserIdFromContext } from '@/shared/utils/auth';

export const webhookController = {
  getWebhooks: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const webhooks = await container.listWebhooksUseCase.execute(userId);
    return c.json(webhooks.map(w => w.getProps()));
  },

  createWebhook: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const { url, events } = await c.req.json();
    if (!url || !events || !Array.isArray(events)) {
      return c.json({ error: 'Invalid payload' }, 400);
    }

    const webhook = await container.createWebhookUseCase.execute({ userId, url, events });
    return c.json(webhook.getProps(), 201);
  },

  deleteWebhook: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const id = c.req.param('id');
    if (!id) return c.json({ error: 'Missing ID' }, 400);

    try {
      await container.deleteWebhookUseCase.execute({ id, userId });
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ error: err.message }, 404);
    }
  },

  testWebhook: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const id = c.req.param('id');
    if (!id) return c.json({ error: 'Missing ID' }, 400);

    const testPayload = {
      id: randomUUID(),
      formId: 'test-form-id',
      content: 'This is a webhook test! 🚀',
      authorName: 'ReviewsKits Tester',
      authorEmail: 'test@example.com',
      rating: 5,
      createdAt: new Date().toISOString()
    };

    try {
      await container.testWebhookUseCase.execute({ id, userId, payload: testPayload });
      return c.json({ success: true, message: 'Test sent successfully' });
    } catch (err: any) {
      return c.json({ error: 'Failed to send test', details: err.message }, 500);
    }
  }
};
