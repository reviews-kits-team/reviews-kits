import type { Context, Next } from 'hono';
import { container } from '@/infrastructure/container';

export const verifyApiKey = async (c: Context, next: Next) => {
  const apiKeyStr = c.req.header('X-Api-Key');

  if (!apiKeyStr) {
    return c.json({ error: 'Missing API Key' }, 401);
  }

  const verifyApiKeyUseCase = container.verifyApiKey;
  const apiKey = await verifyApiKeyUseCase.execute(apiKeyStr);

  if (!apiKey) {
    return c.json({ error: 'Invalid or inactive API Key' }, 401);
  }

  // Set the user in the context for downstream use
  c.set('userId', apiKey.userId);
  c.set('apiKeyType', apiKey.type);

  // Update last used
  apiKey.updateLastUsed();
  await container.apiKeyRepository.update(apiKey);

  await next();
};
