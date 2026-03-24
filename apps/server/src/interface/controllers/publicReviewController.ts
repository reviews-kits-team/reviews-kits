import type { Context } from 'hono';
import { container } from '@/infrastructure/container';
import { Testimonial } from '@/domain/entities/Testimonial';
import { Rating } from '@/domain/value-objects/Rating';
import { Email } from '@/domain/value-objects/Email';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

const submitReviewSchema = z.object({
  formId: z.string().min(1, 'formId is required'),
  content: z.string().min(1, 'content is required').max(5000, 'content is too long (max 5000 characters)'),
  authorName: z.string().min(1, 'authorName is required').max(100, 'authorName is too long'),
  authorEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
  rating: z.union([z.string(), z.number()]).optional(),
  authorTitle: z.string().max(100).optional(),
  authorUrl: z.string().url('Invalid URL format').refine(val => val.startsWith('http://') || val.startsWith('https://'), {
    message: "Only http and https protocols are allowed for authorUrl"
  }).optional().or(z.literal('')),
  _honey: z.string().optional()
});

export const publicReviewController = {
  /**
   * Fetch approved reviews for a user based on public API key context
   */
  getReviews: async (c: Context) => {
    const userId = c.get('userId' as any); // Hono context 'get' for variables
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
      if (!form || form.getUserId() !== userId) {
        return c.json({ error: 'Form not found or invalid public ID' }, 404);
      }

      const testimonials = await container.testimonialRepository.findApprovedByUser(userId as string, {
        limit: Math.min(limit, 50), // Cap at 50 for performance
        minRating: minRating > 0 ? minRating : undefined,
        formId: form.getId()
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
            source: props.source
          };
        })
      });
    } catch (error) {
      console.error('Failed to fetch public reviews:', error);
      const isProduction = process.env.NODE_ENV === 'production';
      return c.json({ error: isProduction ? 'Internal server error' : (error instanceof Error ? error.message : 'Internal server error') }, 500);
    }
  },

  /**
   * Submit a new review (publicly accessible)
   */
  submitReview: async (c: Context) => {
    const rawBody = await c.req.json().catch(() => ({}));
    const validation = submitReviewSchema.safeParse(rawBody);
    
    if (!validation.success) {
      return c.json({ error: validation.error.issues[0]?.message || 'Invalid input' }, 400);
    }

    const { formId, content, authorName, authorEmail, rating, authorTitle, authorUrl, _honey } = validation.data;

    // Honeypot check - Spambots usually fill hidden fields
    if (_honey) {
      // Silently discard to fool the bot
      return c.json({ 
        success: true, 
        message: 'Review submitted successfully',
        id: randomUUID()
      }, 201);
    }

    try {
      // Resolve internal form and user
      const form = await container.formRepository.findByPublicId(formId);
      if (!form) {
        return c.json({ error: 'Invalid form ID' }, 404);
      }

      const testimonial = new Testimonial({
        id: randomUUID(),
        userId: form.getUserId(),
        formId: form.getId(),
        content,
        authorName,
        rating: (rating !== undefined && rating !== null && rating !== '') ? Rating.create(Number(rating)) : undefined,
        authorEmail: (authorEmail && authorEmail !== '') ? Email.create(authorEmail) : undefined,
        authorTitle,
        authorUrl: (authorUrl && authorUrl !== '') ? authorUrl : undefined,
        status: 'pending',
        source: 'form'
      });

      await container.testimonialRepository.save(testimonial);

      return c.json({ 
        success: true, 
        message: 'Review submitted successfully',
        id: testimonial.getId()
      }, 201);
    } catch (error: unknown) {
      console.error('Failed to submit public review:', error);
      const isProduction = process.env.NODE_ENV === 'production';
      const message = (isProduction || !(error instanceof Error)) ? 'Internal server error' : error.message;
      return c.json({ error: message }, 500);
    }
  },

  /**
   * Get public form configuration by slug
   */
  getFormBySlug: async (c: Context) => {
    const slug = c.req.param('slug');
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

      await container.formRepository.incrementVisits(form.getId()).catch(console.error);

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
