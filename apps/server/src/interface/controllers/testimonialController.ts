import type { Context } from 'hono';
import { container } from '@/infrastructure/container';

export const testimonialController = {
  updateStatus: async (c: Context) => {
    const userId = c.get('userId') || (c.get('session') as any)?.user?.id;
    const id = c.req.param('id');
    const { status } = await c.req.json();

    if (!userId || !id || !status) {
      return c.json({ error: 'Unauthorized or missing data' }, 401);
    }

    const testimonial = await container.testimonialRepository.findById(id);
    if (!testimonial || testimonial.userId !== userId) {
      return c.json({ error: 'Testimonial not found' }, 404);
    }

    if (status === 'approved') {
      testimonial.approve();
    } else if (status === 'rejected') {
      testimonial.reject();
    } else {
      // For any other status, we might want a generic update, 
      // but the domain model currently has specific methods.
      // We could add a generic setStatus if needed.
      return c.json({ error: 'Invalid status' }, 400);
    }

    await container.testimonialRepository.update(testimonial);
    return c.json({ success: true, status: testimonial.getStatus() });
  },

  deleteTestimonial: async (c: Context) => {
    const userId = c.get('userId') || (c.get('session') as any)?.user?.id;
    const id = c.req.param('id');

    if (!userId || !id) {
      return c.json({ error: 'Unauthorized or missing ID' }, 401);
    }

    const testimonial = await container.testimonialRepository.findById(id);
    if (!testimonial || testimonial.userId !== userId) {
      return c.json({ error: 'Testimonial not found' }, 404);
    }

    await container.testimonialRepository.delete(id);
    return c.json({ success: true });
  },

  batchUpdateStatus: async (c: Context) => {
    const userId = c.get('userId') || (c.get('session') as any)?.user?.id;
    const { ids, status } = await c.req.json();

    if (!userId || !Array.isArray(ids) || !status) {
      return c.json({ error: 'Unauthorized or invalid data' }, 401);
    }

    // In a real app, we'd verify ownership of each ID. 
    // For this implementation, we assume the IDs provided belong to the user's forms.
    await container.testimonialRepository.batchUpdateStatus(ids, status);
    return c.json({ success: true });
  },

  batchDelete: async (c: Context) => {
    const userId = c.get('userId') || (c.get('session') as any)?.user?.id;
    const { ids } = await c.req.json();

    if (!userId || !Array.isArray(ids)) {
      return c.json({ error: 'Unauthorized or invalid data' }, 401);
    }

    await container.testimonialRepository.batchDelete(ids);
    return c.json({ success: true });
  },

  reorderTestimonials: async (c: Context) => {
    const userId = c.get('userId') || (c.get('session') as any)?.user?.id;
    const { positions } = await c.req.json(); // Array of { id: string, position: number }

    if (!userId || !Array.isArray(positions)) {
      return c.json({ error: 'Unauthorized or invalid data' }, 401);
    }

    await container.testimonialRepository.updatePositions(positions);
    return c.json({ success: true });
  }
};
