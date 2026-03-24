import type { Context } from 'hono';
import { getUserIdFromContext } from '@/shared/utils/auth';
import { container } from '@/infrastructure/container';

export const testimonialController = {
  updateStatus: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    const id = c.req.param('id');
    const { status } = await c.req.json();

    if (!userId || !id || !status) {
      return c.json({ error: 'Unauthorized or missing data' }, 401);
    }

    try {
      const result = await container.updateTestimonialStatusUseCase.execute({
        id,
        userId,
        status: status as 'approved' | 'rejected' | 'pending'
      });
      return c.json({ success: true, status: result.status });
    } catch (err: any) {
      const status = err.message === 'Testimonial not found' ? 404 : 400;
      return c.json({ error: err.message }, status);
    }
  },

  batchUpdateStatus: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    const { ids, status } = await c.req.json();

    if (!userId || !Array.isArray(ids) || ids.length === 0 || !status) {
      return c.json({ error: 'Unauthorized or invalid data' }, 401);
    }

    try {
      await container.batchUpdateTestimonialStatusUseCase.execute({
        ids,
        userId,
        status: status as 'approved' | 'rejected' | 'pending'
      });
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ error: err.message }, 403);
    }
  },

  reorderTestimonials: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    const { positions } = await c.req.json() as { positions: { id: string, position: number }[] };

    if (!userId || !Array.isArray(positions)) {
      return c.json({ error: 'Unauthorized or invalid data' }, 401);
    }

    try {
      await container.reorderTestimonialsUseCase.execute({
        userId,
        positions
      });
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ error: err.message }, 403);
    }
  }
};
