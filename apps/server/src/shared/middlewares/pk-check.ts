import type { Context, Next } from 'hono';
import { container } from '@/infrastructure/container';
import { ApiKeyGenerator } from '@/shared/utils/ApiKeyGenerator';

/**
 * Middleware to check for a valid Public API Key (pk_...)
 * Can be provided via 'x-api-key' header or 'token' query parameter.
 */
export const pkCheck = async (c: Context, next: Next) => {
  const apiKey = c.req.header('x-api-key') || c.req.query('token');

  if (!apiKey || !ApiKeyGenerator.isPublicKey(apiKey)) {
    return c.json({ error: 'Missing or invalid public API key' }, 401);
  }

  try {
    const keyRecord = await container.apiKeyRepository.findByKey(apiKey);
    
    if (!keyRecord || keyRecord.getProps().type !== 'public' || !keyRecord.getProps().isActive) {
      return c.json({ error: 'Invalid or inactive public API key' }, 401);
    }

    // Set the userId in context so the controller knows whose reviews to fetch
    c.set('userId', keyRecord.getProps().userId);
    
    // Update last used timestamp (fire and forget)
    keyRecord.updateLastUsed();
    container.apiKeyRepository.update(keyRecord).catch(console.error);

    await next();
  } catch (error) {
    console.error('Public API Key check failed:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};
