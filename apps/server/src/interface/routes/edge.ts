import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { container } from '@/infrastructure/container';

export const edgeRouter = new OpenAPIHono();

const getEdgeReviewsRoute = createRoute({
  method: 'get',
  path: '/reviews',
  summary: 'Get pre-rendered HTML/CSS for reviews (Zero-JS)',
  description: 'Returns pure HTML and CSS for embedding reviews without JavaScript.',
  tags: ['Edge'],
  request: {
    query: z.object({
      formId: z.string().openapi({ param: { name: 'formId', in: 'query', required: true }, example: 'rk_frm_xxx' }),
      limit: z.string().optional().openapi({ param: { name: 'limit', in: 'query' }, example: '10' }),
      minRating: z.string().optional().openapi({ param: { name: 'minRating', in: 'query' }, example: '4' }),
      style: z.enum(['cards', 'list', 'minimal']).optional().openapi({ param: { name: 'style', in: 'query' }, example: 'cards' }),
    }),
    headers: z.object({
      'x-api-key': z.string().optional().openapi({ param: { name: 'x-api-key', in: 'header' } }),
    }),
  },
  responses: {
    200: { description: 'Pre-rendered HTML with inline CSS', content: { 'text/html': { schema: z.string() } } },
    401: { description: 'Unauthorized' },
    404: { description: 'Form not found' },
  },
});

function generateStars(rating: number): string {
  return '<span class="rk-stars">' + '★'.repeat(rating) + '☆'.repeat(5 - rating) + '</span>';
}

function generateReviewCard(review: any, style: string): string {
  const stars = review.rating ? generateStars(review.rating) : '';
  const authorName = review.author?.name || 'Anonymous';
  const authorTitle = review.author?.title ? '<span class="rk-author-title">' + review.author.title + '</span>' : '';
  
  if (style === 'minimal') {
    return '<div class="rk-review rk-minimal"><blockquote class="rk-content">"' + review.content + '"</blockquote><div class="rk-meta">' + authorName + ' ' + authorTitle + ' ' + stars + '</div></div>';
  }
  if (style === 'list') {
    return '<div class="rk-review rk-list"><div class="rk-header">' + stars + '<span class="rk-author">' + authorName + '</span></div><blockquote class="rk-content">"' + review.content + '"</blockquote></div>';
  }
  return '<div class="rk-card"><div class="rk-card-header">' + stars + '<div class="rk-author-info">' + authorName + authorTitle + '</div></div><blockquote class="rk-card-content">"' + review.content + '"</blockquote></div>';
}

function generateCSS(style: string): string {
  const base = '.rk-container{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;line-height:1.6;color:#333;max-width:800px;margin:0 auto;padding:16px}.rk-review{margin-bottom:16px}.rk-stars{color:#fbbf24;letter-spacing:2px}.rk-author-name,.rk-author{font-weight:600;color:#1f2937}.rk-author-title{color:#6b7280;font-size:.875em;margin-left:8px}.rk-content{margin:8px 0;font-style:italic;color:#4b5563;border-left:3px solid #e5e7eb;padding-left:12px}';
  if (style === 'cards') return base + '.rk-card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;box-shadow:0 1px 3px rgba(0,0,0,.1)}.rk-card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.rk-card-content{margin:12px 0 0;font-size:1rem}';
  if (style === 'list') return base + '.rk-list{border-bottom:1px solid #e5e7eb;padding:12px 0}.rk-list:first-child{border-top:1px solid #e5e7eb}.rk-header{display:flex;align-items:center;gap:12px;margin-bottom:8px}';
  return base + '.rk-minimal .rk-meta{font-size:.875rem;color:#6b7280;margin-top:8px}';
}

edgeRouter.openapi(getEdgeReviewsRoute, async (c) => {
  const apiKey = c.req.header('x-api-key') || c.req.query('token');
  const publicId = c.req.query('formId');
  const limit = parseInt(c.req.query('limit') || '10', 10);
  const minRating = parseInt(c.req.query('minRating') || '0', 10);
  const style = (c.req.query('style') || 'cards') as 'cards' | 'list' | 'minimal';

  if (!publicId) return c.html('<p>Missing formId parameter</p>', 400);
  if (!apiKey) return c.html('<p>Missing API key</p>', 401);

  try {
    const reviews = await container.getPublicReviewsUseCase.execute({ publicId, limit, minRating: minRating > 0 ? minRating : undefined });
    const css = generateCSS(style);
    const reviewsHTML = reviews.map(r => generateReviewCard(r, style)).join('');
    const html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Reviews</title><style>' + css + '</style></head><body><div class="rk-container">' + (reviews.length > 0 ? reviewsHTML : '<p class="rk-empty">No reviews yet.</p>') + '</div></body></html>';
    return c.html(html, 200, { 'Cache-Control': 'public, max-age=300', 'Content-Type': 'text/html; charset=utf-8' });
  } catch (error) {
    console.error('Edge reviews error:', error);
    if (error instanceof Error && error.message.includes('not found')) return c.html('<p>Form not found</p>', 404);
    return c.html('<p>Failed to load reviews</p>', 500);
  }
});
