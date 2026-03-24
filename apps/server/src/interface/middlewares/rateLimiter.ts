import type { Context, Next } from 'hono';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (options: { limit: number; windowMs: number }) => {
  return async (c: Context, next: Next) => {
    // Attempt to get the real IP, fallback to something generic if not available
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
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
