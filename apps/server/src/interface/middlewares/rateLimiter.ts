import type { Context, Next } from 'hono';
import { getConnInfo } from 'hono/bun';
import { sql, eq } from 'drizzle-orm';
import { db } from '@/infrastructure/database/db';
import { rateLimits } from '@/infrastructure/database/schema';

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
    
    const now = new Date();
    const key = `rl:${ip}`;
    const windowStart = new Date(now.getTime() + options.windowMs);

    try {
      // Distributed rate limiting logic
      const count = await db.transaction(async (tx) => {
        const [existing] = await tx.select().from(rateLimits).where(eq(rateLimits.key, key)).limit(1);
        
        if (!existing || now > existing.resetAt) {
          const [inserted] = await tx.insert(rateLimits)
            .values({ key, count: 1, resetAt: windowStart })
            .onConflictDoUpdate({
              target: rateLimits.key,
              set: { count: 1, resetAt: windowStart }
            })
            .returning({ count: rateLimits.count });
          return inserted?.count ?? 1;
        } else {
          const [updated] = await tx.update(rateLimits)
            .set({ count: sql`${rateLimits.count} + 1` })
            .where(eq(rateLimits.key, key))
            .returning({ count: rateLimits.count });
          return updated?.count ?? existing.count + 1;
        }
      });

      if (count > options.limit) {
        return c.json({ error: 'Too many requests, please try again later.' }, 429);
      }
    } catch (error) {
      console.error('Rate limiter database error:', error);
    }
    
    await next();
  };
};
