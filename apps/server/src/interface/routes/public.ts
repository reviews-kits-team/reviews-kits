import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { pkCheck } from '../../shared/middlewares/pk-check';
import { publicReviewController } from '../controllers/publicReviewController';

export const publicRouter = new OpenAPIHono();

// Enable CORS for all origins on the public API
publicRouter.use('*', cors());

// Authentication check for public keys
publicRouter.use('/reviews', pkCheck);

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

// Endpoint to fetch approved reviews
publicRouter.openapi(getReviewsRoute, publicReviewController.getReviews as any);
