import type { Context } from 'hono';
import { container } from '@/infrastructure/container';

export const apiKeyController = {
  getApiKeys: async (c: Context) => {
    const session = c.get('session');
    const userId = session?.user?.id;

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { publicKey, secretKey } = await container.generateUserApiKeys.execute(userId);
    
    return c.json({
      publicKey,
      secretKey,
    });
  },

  rotateKeys: async (c: Context) => {
    const session = c.get('session');
    const userId = session?.user?.id;

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Deactivate old keys
    const keys = await container.apiKeyRepository.findByUser(userId);
    for (const key of keys) {
      key.deactivate();
      await container.apiKeyRepository.update(key);
    }

    // Generate new ones
    const { publicKey, secretKey } = await container.generateUserApiKeys.execute(userId);

    return c.json({
      publicKey,
      secretKey,
    });
  }
};
