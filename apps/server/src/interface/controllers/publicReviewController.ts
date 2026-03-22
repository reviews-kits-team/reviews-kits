import type { Context } from 'hono';
import { container } from '@/infrastructure/container';

export const publicReviewController = {
  /**
   * Fetch approved reviews for a user based on public API key context
   */
  getReviews: async (c: Context) => {
    const userId = c.get('userId');
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const limit = parseInt(c.req.query('limit') || '10', 10);
    const minRating = parseInt(c.req.query('minRating') || '0', 10);
    const publicId = c.req.query('formId');

    if (!publicId) {
      return c.json({ error: 'Missing formId query parameter' }, 400);
    }

    try {
      // Resolve internal ID from public ID
      const form = await container.formRepository.findByPublicId(publicId);
      if (!form || form.userId !== userId) {
        return c.json({ error: 'Form not found or invalid public ID' }, 404);
      }

      const testimonials = await container.testimonialRepository.findApprovedByUser(userId as string, {
        limit: Math.min(limit, 50), // Cap at 50 for performance
        minRating: minRating > 0 ? minRating : undefined,
        formId: form.id
      });

      return c.json({
        data: testimonials.map(t => {
          const props = t.getProps();
          return {
            id: props.id,
            content: props.content,
            rating: props.rating?.getValue(),
            authorName: props.authorName,
            authorTitle: props.authorTitle,
            authorUrl: props.authorUrl,
            createdAt: props.createdAt,
            type: props.source
          };
        })
      });
    } catch (error) {
      console.error('Failed to fetch public reviews:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
};
