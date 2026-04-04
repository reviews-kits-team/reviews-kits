import type { Context, Next } from 'hono';
import { container } from '@/infrastructure/container';

export const verifyApiKey = async (c: Context, next: Next) => {
  const apiKeyStr = c.req.header('X-Api-Key');

  if (!apiKeyStr) {
    return c.json({ error: 'Missing API Key' }, 401);
  }

  const apiKey = await container.verifyApiKey.execute(apiKeyStr);

  if (!apiKey) {
    return c.json({ error: 'Invalid or inactive API Key' }, 401);
  }

  c.set('userId', apiKey.userId);
  c.set('apiKeyType', apiKey.type);

  await container.recordApiKeyUsageUseCase.execute(apiKey);

  await next();
};
