import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { pkCheck } from '../../shared/middlewares/pk-check';
import { publicReviewController } from '../controllers/publicReviewController';

export const publicRouter = new OpenAPIHono();

// Enable CORS for all origins on the public API
publicRouter.use('*', cors());

// Authentication is handled specifically per route

const getReviewsRoute = createRoute({
  method: 'get',
  path: '/reviews',
  summary: 'Fetch approved reviews',
  description: 'Retrieve a list of approved testimonials using a public API key.',
  tags: ['Public'],
  request: {
    query: z.object({
      limit: z.string().optional().openapi({
        param: {
          name: 'limit',
          in: 'query',
        },
        example: '10',
      }),
      minRating: z.string().optional().openapi({
        param: {
          name: 'minRating',
          in: 'query',
        },
        example: '4',
      }),
      token: z.string().optional().openapi({
        param: {
          name: 'token',
          in: 'query',
        },
        example: 'rk_pk_live_...',
      }),
      formId: z.string().openapi({
        param: {
          name: 'formId',
          in: 'query',
          required: true,
        },
        example: 'rk_frm_live_abc123...',
      }),
    }),
    headers: z.object({
      'x-api-key': z.string().optional().openapi({
        param: {
          name: 'x-api-key',
          in: 'header',
        },
        example: 'rk_pk_live_...',
      }),
    }),
  },
  responses: {
    200: {
      description: 'List of approved reviews',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(z.object({
              id: z.string(),
              content: z.string(),
              rating: z.number().optional(),
              authorName: z.string(),
              authorTitle: z.string().optional(),
              authorUrl: z.string().optional(),
              createdAt: z.date().or(z.string()),
              type: z.string(),
            })),
          }),
        },
      },
    },
    401: {
      description: 'Unauthorized - Missing or invalid API key',
    },
  },
});

const submitReviewRoute = createRoute({
  method: 'post',
  path: '/reviews',
  summary: 'Submit a new review',
  description: 'Submit a new testimonial/review for a specific form.',
  tags: ['Public'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            formId: z.string().openapi({ example: 'rk_frm_live_...' }),
            content: z.string().openapi({ example: 'Great product!' }),
            authorName: z.string().openapi({ example: 'John Doe' }),
            rating: z.number().min(1).max(5).optional().openapi({ example: 5 }),
            authorEmail: z.string().email().optional().openapi({ example: 'john@example.com' }),
            authorTitle: z.string().optional().openapi({ example: 'CEO' }),
            authorUrl: z.string().optional().openapi({ example: 'https://example.com' }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Review submitted successfully',
    },
    400: {
      description: 'Invalid input data',
    },
    404: {
      description: 'Form not found',
    },
  },
});

const getFormBySlugRoute = createRoute({
  method: 'get',
  path: '/forms/{slug}',
  summary: 'Get form details by slug',
  description: 'Retrieve public form configuration for rendering the collection form.',
  tags: ['Public'],
  request: {
    params: z.object({
      slug: z.string().openapi({ example: 'mon-formulaire' }),
    }),
  },
  responses: {
    200: {
      description: 'Form details',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            publicId: z.string(),
            name: z.string(),
            description: z.string().optional(),
            config: z.any(),
          }),
        },
      },
    },
    404: {
      description: 'Form not found',
    },
  },
});

// Apply Public API Key check to reviews path
publicRouter.use('/reviews', pkCheck);

// Register routes
publicRouter.openapi(getReviewsRoute, (c) => publicReviewController.getReviews(c));
publicRouter.openapi(submitReviewRoute, (c) => publicReviewController.submitReview(c));
publicRouter.openapi(getFormBySlugRoute, (c) => publicReviewController.getFormBySlug(c));
