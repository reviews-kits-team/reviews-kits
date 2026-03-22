import type { Context } from 'hono';
import { container } from '@/infrastructure/container';

export const dashboardController = {
  getStats: async (c: Context) => {
    const userId = c.get('userId') || (c.get('session') as any)?.user?.id;
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
      const stats = await container.getDashboardStats.execute(userId);
      return c.json(stats);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
};
