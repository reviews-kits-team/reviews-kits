import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { isAuthenticated } from '../../shared/middlewares/auth';
import { apiKeyController } from '../controllers/apiKeyController';

export const apiKeysRouter = new OpenAPIHono();

// Apply Authentication protection
apiKeysRouter.use('*', isAuthenticated);

const getApiKeysRoute = createRoute({
  method: 'get',
  path: '/',
  summary: 'Get the user API keys',
  tags: ['API Keys'],
  responses: {
    200: {
      description: 'The user API keys',
    },
  },
});

const rotateApiKeysRoute = createRoute({
  method: 'post',
  path: '/rotate',
  summary: 'Rotate (regenerate) the user API keys',
  tags: ['API Keys'],
  responses: {
    200: {
      description: 'The new API keys',
    },
  },
});

apiKeysRouter.openapi(getApiKeysRoute, apiKeyController.getApiKeys);
apiKeysRouter.openapi(rotateApiKeysRoute, apiKeyController.rotateKeys);
