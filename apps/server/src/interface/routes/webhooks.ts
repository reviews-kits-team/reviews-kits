import { Hono } from 'hono';
import { webhookController } from '../controllers/webhookController';

const router = new Hono();

router.get('/', webhookController.getWebhooks);
router.post('/', webhookController.createWebhook);
router.post('/:id/test', webhookController.testWebhook);
router.delete('/:id', webhookController.deleteWebhook);

export default router;
