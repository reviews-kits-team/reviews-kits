import type { Context } from 'hono';

/**
 * Extracts the authenticated user ID from the expected Hono Context scopes.
 * Handles both API contexts and Session contexts.
 */
export const getUserIdFromContext = (c: Context): string | undefined => {
  return c.get('userId') || (c.get('session') as any)?.user?.id;
};
