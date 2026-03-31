import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import path from 'node:path';
import { migrate } from 'drizzle-orm/bun-sql/migrator';
import { eq } from 'drizzle-orm';
import { db } from './infrastructure/database/db';
import { auth } from './infrastructure/auth/auth';
import { users } from './infrastructure/database/schema';
import { authRouter } from './interface/routes/auth';
import { adminRouter } from './interface/routes/admin';

import { meRouter } from './interface/routes/me';
import { formsRouter } from './interface/routes/forms';
import { apiKeysRouter } from './interface/routes/api-keys';
import { publicRouter } from './interface/routes/public';
import { dashboardRouter } from './interface/routes/dashboard';
import { testimonialsRouter } from './interface/routes/testimonials';
import webhooksRouter from './interface/routes/webhooks';

// Database preparation (Migrations and Seeding)
const runMigrations = async () => {
  console.log('--- 🛢️ Database Preparation ---');
  console.log(`Environment: ${process.env.NODE_ENV}`);
  
  try {
    const migrationsPath = path.resolve(process.cwd(), 'drizzle');
    console.log(`⏳ Running database migrations from: ${migrationsPath}`);
    
    await migrate(db, { migrationsFolder: migrationsPath });
    console.log('✅ Migrations completed successfully');

    // Auto-seed admin user
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (adminEmail && adminPassword) {
      console.log(`⏳ Checking admin user: ${adminEmail}...`);
      const existingUser = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
      const user = existingUser[0];
      
      if (user) {
        if (!user.isSystemAdmin) {
          await db.update(users).set({ isSystemAdmin: true }).where(eq(users.email, adminEmail));
          console.log(`✅ Granted admin privileges to existing user.`);
        } else {
          console.log(`ℹ️ Admin user already exists and has privileges.`);
        }
      } else {
        console.log(`⏳ Admin user not found. Creating...`);
        const res = await auth.api.signUpEmail({
          body: { email: adminEmail, password: adminPassword, name: "System Administrator" },
          headers: new Headers()
        });
        
        if (res?.user) {
          await db.update(users).set({ isSystemAdmin: true, emailVerified: true }).where(eq(users.email, adminEmail));
          console.log(`✅ Admin user created automatically.`);
        } else {
          console.error(`❌ Failed to create admin user:`, res);
        }
      }
    } else {
      console.log('⚠️ ADMIN_EMAIL or ADMIN_PASSWORD not set. Skipping admin auto-seed.');
    }
  } catch (error) {
    console.error('❌ Database preparation failed:', error);
    // Only exit in production to prevent partial boot in unstable state
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
  console.log('--- 🏁 Database Preparation Finished ---\n');
};

// Start migrations immediately
await runMigrations();

const app = new OpenAPIHono();

// Enable CORS
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS 
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5174', 'http://localhost:5180', 'http://localhost:3000'];

app.use('*', cors({
  origin: allowedOrigins,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  exposeHeaders: ['Content-Length', 'Set-Cookie'],
  credentials: true,
}));

// Global Error Handler
app.onError((err: Error, c) => {
  // Handle Better-Auth APIError (which has statusCode and body)
  if (err && typeof err === 'object' && 'statusCode' in err && 'body' in err) {
    const apiErr = err as any;
    return c.json(apiErr.body, apiErr.statusCode as any);
  }

  // Default error response
  const isProduction = process.env.NODE_ENV === 'production';
  console.error('[API Error]:', err);
  
  return c.json({
    success: false,
    error: {
      name: isProduction ? 'InternalServerError' : (err.name || 'InternalServerError'),
      message: isProduction ? 'An unexpected error occurred' : (err.message || 'An unexpected error occurred'),
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
app.route('/api/v1/dashboard', dashboardRouter);
app.route('/api/v1/testimonials', testimonialsRouter);
app.route('/api/v1/webhooks', webhooksRouter);

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
