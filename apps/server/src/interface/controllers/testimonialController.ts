import type { Context } from 'hono';
import { getUserIdFromContext } from '@/shared/utils/auth';
import { container } from '@/infrastructure/container';
import { NotFoundError } from '@/domain/errors/NotFoundError';

export const testimonialController = {
  getById: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    const id = c.req.param('id');

    if (!userId || !id) {
      return c.json({ error: 'Unauthorized or missing ID' }, 401);
    }

    try {
      const testimonial = await container.getTestimonialByIdUseCase.execute({ id, userId });
      return c.json(testimonial);
    } catch (err: any) {
      const status = err instanceof NotFoundError ? 404 : 500;
      return c.json({ error: err.message }, status);
    }
  },

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
  },

  exportTestimonials: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    const formId = c.req.query('formId');

    if (!userId || !formId) {
      return c.json({ error: 'Unauthorized or missing formId' }, 401);
    }

    try {
      const data = await container.exportTestimonialsUseCase.execute({
        userId,
        formId
      });

      // Simple CSV generation
      const firstItem = data[0];
      if (!firstItem) {
        return c.text('No testimonials to export', 404);
      }

      const headers = Object.keys(firstItem).join(',');
      const rows = data.map(item => 
        Object.values(item).map(v => 
          typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
        ).join(',')
      ).join('\n');

      const csv = `${headers}\n${rows}`;

      c.header('Content-Type', 'text/csv');
      c.header('Content-Disposition', `attachment; filename="testimonials-${formId}.csv"`);
      return c.text(csv);
    } catch (err: any) {
      return c.json({ error: err.message }, 400);
    }
  },

  importTestimonials: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    const { formId, data } = await c.req.json();

    if (!userId || !formId || !Array.isArray(data)) {
      return c.json({ error: 'Unauthorized or invalid data' }, 401);
    }

    try {
      const result = await container.importTestimonialsUseCase.execute({
        userId,
        formId,
        data
      });
      return c.json({ success: true, ...result });
    } catch (err: any) {
      return c.json({ error: err.message }, 400);
    }
  }
};
