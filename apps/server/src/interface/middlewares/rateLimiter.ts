import type { Context, Next } from 'hono';

import { getConnInfo } from 'hono/bun';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (options: { limit: number; windowMs: number }) => {
  return async (c: Context, next: Next) => {
    let ip = 'unknown';

    try {
      // Use getConnInfo for Bun to get the real remote address
      const info = getConnInfo(c);
      ip = info.remote.address || 'unknown';
    } catch (e) {
      // Fallback for environments where getConnInfo might fail (like some test setups)
      ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 
           c.req.header('x-real-ip') || 
           'unknown';
    }
    
    const now = Date.now();
    let record = rateLimitMap.get(ip);
    
    // Clean up expired window
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + options.windowMs };
    }
    
    record.count++;
    rateLimitMap.set(ip, record);

    if (record.count > options.limit) {
      return c.json({ error: 'Too many requests, please try again later.' }, 429);
    }
    
    await next();
  };
};
