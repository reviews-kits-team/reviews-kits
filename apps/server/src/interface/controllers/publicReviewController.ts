import type { Context } from 'hono';
import { container } from '@/infrastructure/container';
import { Testimonial } from '@/domain/entities/Testimonial';
import { Rating } from '@/domain/value-objects/Rating';
import { Email } from '@/domain/value-objects/Email';
import { randomUUID } from 'node:crypto';

export const publicReviewController = {
  /**
   * Fetch approved reviews for a user based on public API key context
   */
  getReviews: async (c: any) => {
    // Defensive check to avoid TypeError: c.get is not a function
    if (!c || typeof c.get !== 'function') {
      console.error('[API Error] Context c is invalid in getReviews:', typeof c, Object.keys(c || {}));
      return (c as any)?.json ? (c as any).json({ error: 'Internal context error' }, 500) : new Response('Internal context error', { status: 500 });
    }

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
  },

  /**
   * Submit a new review (publicly accessible)
   */
  submitReview: async (c: Context) => {
    const body = await c.req.json();
    const { formId, content, authorName, authorEmail, rating, authorTitle, authorUrl } = body;

    if (!formId || !content || !authorName) {
      return c.json({ error: 'Missing required fields: formId, content, authorName' }, 400);
    }

    try {
      // Resolve internal form and user
      const form = await container.formRepository.findByPublicId(formId);
      if (!form) {
        return c.json({ error: 'Invalid form ID' }, 404);
      }

      const testimonial = new Testimonial({
        id: randomUUID(),
        userId: form.userId,
        formId: form.id,
        content,
        authorName,
        rating: rating ? Rating.create(Number(rating)) : undefined,
        authorEmail: authorEmail ? Email.create(authorEmail) : undefined,
        authorTitle,
        authorUrl,
        status: 'pending',
        source: 'form'
      });

      await container.testimonialRepository.save(testimonial);

      return c.json({ 
        success: true, 
        message: 'Review submitted successfully',
        id: testimonial.id
      }, 201);
    } catch (error: any) {
      console.error('Failed to submit public review:', error);
      return c.json({ error: error.message || 'Internal server error' }, 500);
    }
  },

  /**
   * Get public form configuration by slug
   */
  getFormBySlug: async (c: any) => {
    const slug = (c.req as any).param('slug');
    if (!slug) {
      return c.json({ error: 'Missing slug' }, 400);
    }

    try {
      let form = await container.formRepository.findBySlug(slug);
      
      // Fallback to publicId if slug doesn't match
      if (!form) {
        form = await container.formRepository.findByPublicId(slug);
      }

      if (!form) {
        return c.json({ error: 'Form not found' }, 404);
      }

      if (!form.getIsActive()) {
        return c.json({ error: 'This form is currently inactive' }, 403);
      }

      await container.formRepository.incrementVisits(form.id).catch(console.error);

      const props = form.getProps();
      return c.json({
        id: props.id,
        publicId: props.publicId,
        name: props.name,
        description: props.description,
        config: props.config,
      });
    } catch (error) {
      console.error('Failed to get form by slug:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
};
