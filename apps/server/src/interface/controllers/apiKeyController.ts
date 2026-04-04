import type { Context } from 'hono';
import { container } from '@/infrastructure/container';
import { getUserIdFromContext } from '@/shared/utils/auth';

export const apiKeyController = {
  getApiKeys: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const { publicKey, secretKey } = await container.generateUserApiKeys.execute(userId);
    return c.json({ publicKey, secretKey });
  },

  rotateKeys: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const { publicKey, secretKey } = await container.rotateApiKeysUseCase.execute(userId);
    return c.json({ publicKey, secretKey });
  }
};
