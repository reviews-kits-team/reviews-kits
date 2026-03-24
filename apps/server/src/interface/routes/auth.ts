import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { auth } from '../../infrastructure/auth/auth';

export const authRouter = new OpenAPIHono();

// Documents: Sign Up (Email)
const signUpRoute = createRoute({
  method: 'post',
  path: '/sign-up/email',
  summary: 'Sign up with email and password',
  tags: ['Authentication'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            email: z.email(),
            password: z.string().min(8),
            name: z.string(),
            image: z.string().optional()
          })
        }
      }
    }
  },
  responses: {
    200: { description: 'User created' },
    400: { description: 'Bad request' }
  }
});

// Documents: Sign In (Email)
const signInRoute = createRoute({
  method: 'post',
  path: '/sign-in/email',
  summary: 'Sign in with email and password',
  tags: ['Authentication'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            email: z.email(),
            password: z.string()
          })
        }
      }
    }
  },
  responses: {
    200: { description: 'Successfully signed in' },
    401: { description: 'Unauthorized' }
  }
});

// Documents: Get Session
const getSessionRoute = createRoute({
  method: 'get',
  path: '/get-session',
  summary: 'Retrieve current user session',
  tags: ['Authentication'],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            session: z.any(),
            user: z.any()
          }).nullable()
        }
      },
      description: 'Current session data'
    }
  }
});

// Documents: Sign Out
const signOutRoute = createRoute({
  method: 'post',
  path: '/sign-out',
  summary: 'Terminate current session',
  tags: ['Authentication'],
  responses: {
    200: { description: 'Successfully signed out' },
  },
});

// ─── Rebuilds a Request for Better-Auth ────────────────────────────────────
/**
 * Create a new Request object from Hono Context, using validated Zod body.
 * This avoids "ERR_BODY_ALREADY_USED" since the new request has its own stream.
 */
function rebuiltRequest(c: any, body?: unknown): Request {
  return new Request(c.req.raw.url, {
    method: c.req.raw.method,
    headers: c.req.raw.headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ─── Handlers ────────────────────────────────────────────────────────────────

// Sign Up Handler
authRouter.openapi(signUpRoute, (c) => {
  const body = c.req.valid('json'); // Data already validated by zod-openapi
  return auth.handler(rebuiltRequest(c, body)) as any;
});

// Sign In Handler
authRouter.openapi(signInRoute, (c) => {
  const body = c.req.valid('json');
  return auth.handler(rebuiltRequest(c, body)) as any;
});

// Session and Sign Out
authRouter.openapi(getSessionRoute, (c) => auth.handler(c.req.raw) as any);
authRouter.openapi(signOutRoute, (c) => auth.handler(rebuiltRequest(c)) as any);

// ─── Catch-all for other Better-Auth requests ─────────────────────────────────
authRouter.on(['POST', 'GET'], '/*', (c) => auth.handler(c.req.raw));
