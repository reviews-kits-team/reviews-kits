import type { Context } from 'hono';
import { container } from '@/infrastructure/container';
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
  _honey: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
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
      const testimonials = await container.getPublicReviewsUseCase.execute({
        userId: userId as string,
        publicId,
        limit,
        minRating: minRating > 0 ? minRating : undefined
      });

      return c.json({ data: testimonials });
    } catch (error) {
      console.error('Failed to fetch public reviews:', error);
      const isProduction = process.env.NODE_ENV === 'production';
      const status = (error instanceof Error && error.message.includes('not found')) ? 404 : 500;
      return c.json({ error: isProduction ? 'Internal server error' : (error instanceof Error ? error.message : 'Internal server error') }, status);
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

    const { formId, content, authorName, authorEmail, rating, authorTitle, authorUrl, _honey, metadata } = validation.data;

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
      const testimonialId = await container.submitReviewUseCase.execute({
        formId,
        content,
        authorName,
        authorEmail,
        rating,
        authorTitle,
        authorUrl,
        metadata
      });

      return c.json({ 
        success: true, 
        message: 'Review submitted successfully',
        id: testimonialId
      }, 201);
    } catch (error: unknown) {
      console.error('Failed to submit public review:', error);
      const isProduction = process.env.NODE_ENV === 'production';
      const message = (isProduction || !(error instanceof Error)) ? 'Internal server error' : error.message;
      const status = (error instanceof Error && error.message.includes('Invalid form')) ? 404 : 500;
      return c.json({ error: message }, status);
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
      const result = await container.getPublicFormUseCase.execute({ slug });
      return c.json(result);
    } catch (error: any) {
      console.error('Failed to get form by slug:', error);
      const status = error.message === 'Form not found' ? 404 : (error.message.includes('inactive') ? 403 : 500);
      return c.json({ error: error.message }, status);
    }
  }
};
