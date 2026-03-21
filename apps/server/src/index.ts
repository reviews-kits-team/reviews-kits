import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import { authRouter } from './interface/routes/auth';
import { adminRouter } from './interface/routes/admin';

import { meRouter } from './interface/routes/me';
import { formsRouter } from './interface/routes/forms';
import { apiKeysRouter } from './interface/routes/api-keys';
import { publicRouter } from './interface/routes/public';

const app = new OpenAPIHono();

// Enable CORS
app.use('*', cors({
  origin: ['http://172.20.0.1:5180', 'http://localhost:5180', 'http://localhost:3000'], // Allow frontend and self (swagger)
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'Set-Cookie'],
  credentials: true,
}));

// Global Error Handler
app.onError((err, c) => {
  // Handle Better-Auth APIError (which has statusCode and body)
  if (err && typeof err === 'object' && 'statusCode' in err && 'body' in err) {
    const apiErr = err as any;
    return c.json(apiErr.body, apiErr.statusCode as any);
  }

  // Default error response
  console.error('[API Error]:', err);
  return c.json({
    success: false,
    error: {
      name: err.name || 'InternalServerError',
      message: err.message || 'An unexpected error occurred',
    }
  }, 500);
});

// OpenAPI Configuration
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '0.1.0',
    title: 'Reviewskits API',
    description: 'Headless Testimonial API with RBAC protection',
  },
});

// Swagger UI
app.get('/ui', swaggerUI({ url: '/doc' }));

// Mount Auth Routes (standard Hono)
app.route('/api/auth', authRouter);

// Mount Business API Routes (v1)
app.route('/api/v1/me', meRouter);
app.route('/api/v1/admin', adminRouter);
app.route('/api/v1/forms', formsRouter);
app.route('/api/v1/api-keys', apiKeysRouter);
app.route('/api/v1/public', publicRouter);

// Welcome Route
app.get('/', (c) => {
  return c.json({
    name: "Reviewskits API",
    status: "running",
    version: "0.1.0",
    message: "Welcome to the Headless Testimonial API. Visit /ui for documentation.",
    environment: process.env.NODE_ENV || "development"
  });
});

const port = Number(process.env.PORT) || 3000;

console.log(`
  🚀 API Server ready
  ➜  Local:   http://localhost:${port}/
  ➜  Swagger: http://localhost:${port}/ui
`);

export default {
  port,
  fetch: app.fetch,
};
