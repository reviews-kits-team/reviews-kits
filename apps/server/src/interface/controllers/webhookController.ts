import { randomBytes, randomUUID } from 'node:crypto';
import type { Context } from 'hono';
import { container } from '@/infrastructure/container';
import { getUserIdFromContext } from '@/shared/utils/auth';
import { Webhook } from '../../domain/entities/Webhook';

export const webhookController = {
  getWebhooks: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const webhooks = await container.webhookRepository.findByUser(userId);
    return c.json(webhooks.map(w => w.getProps()));
  },

  createWebhook: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const { url, events } = await c.req.json();
    if (!url || !events || !Array.isArray(events)) {
      return c.json({ error: 'Invalid payload' }, 400);
    }

    const webhook = new Webhook({
      id: randomUUID(),
      userId,
      url,
      events,
      secret: randomBytes(24).toString('hex'),
      isActive: true,
    });

    await container.webhookRepository.save(webhook);
    return c.json(webhook.getProps(), 201);
  },

  deleteWebhook: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const id = c.req.param('id');
    if (!id) return c.json({ error: 'Missing ID' }, 400);

    const webhook = await container.webhookRepository.findById(id);

    if (!webhook || webhook.getUserId() !== userId) {
      return c.json({ error: 'Webhook not found' }, 404);
    }

    await container.webhookRepository.delete(id);
    return c.json({ success: true });
  },

  testWebhook: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const id = c.req.param('id');
    if (!id) return c.json({ error: 'Missing ID' }, 400);

    const webhook = await container.webhookRepository.findById(id);

    if (!webhook || webhook.getUserId() !== userId) {
      return c.json({ error: 'Webhook not found' }, 404);
    }

    const testPayload = {
      id: randomUUID(),
      formId: 'test-form-id',
      content: 'Ceci est un test de webhook ! 🚀',
      authorName: 'Testeur ReviewKits',
      authorEmail: 'test@example.com',
      rating: 5,
      createdAt: new Date().toISOString()
    };

    try {
      // Use the service to send the test payload
      // We manually call trigger logic for just this webhook if we want, 
      // but let's just use a direct call to the internal send method if available or mock the trigger
      // For simplicity, let's just trigger a 'testimonial.created' event for this user with test data
      await container.webhookService.trigger('testimonial.created', userId, testPayload);
      return c.json({ success: true, message: 'Test sent successfully' });
    } catch (err: any) {
      return c.json({ error: 'Failed to send test', details: err.message }, 500);
    }
  }
};
