import type { Context } from 'hono';
import { container } from '@/infrastructure/container';
import { ApiKeyGenerator } from '@/shared/utils/ApiKeyGenerator';

/**
 * Middleware to check for a valid Public API Key (pk_...)
 * Can be provided via 'x-api-key' header or 'token' query parameter.
 */
export const pkCheck = async (c: Context, next: () => Promise<any>) => {
  const apiKey = c.req.header('x-api-key') || c.req.query('token');

  if (!apiKey || !ApiKeyGenerator.isPublicKey(apiKey)) {
    return c.json({ error: 'Missing or invalid public API key' }, 401);
  }

  try {
    const keyRecord = await container.verifyPublicApiKeyUseCase.execute(apiKey);

    if (!keyRecord) {
      return c.json({ error: 'Invalid or inactive public API key' }, 401);
    }

    c.set('userId', keyRecord.getProps().userId);

    // Fire-and-forget — recording usage is a side effect, not critical path
    container.recordApiKeyUsageUseCase.execute(keyRecord).catch(console.error);

    return await next();
  } catch (error) {
    console.error('Public API Key check failed:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};
