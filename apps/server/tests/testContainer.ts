/**
 * Test-only container exposing repositories for fixture setup and teardown.
 * Never import this in production code.
 */
import { testDb } from './integration/IntegrationSetup';
import { DrizzleFormRepository } from '../src/infrastructure/repositories/DrizzleFormRepository';
import { DrizzleTestimonialRepository } from '../src/infrastructure/repositories/DrizzleTestimonialRepository';
import { DrizzleApiKeyRepository } from '../src/infrastructure/repositories/DrizzleApiKeyRepository';
import { DrizzleUserRepository } from '../src/infrastructure/repositories/DrizzleUserRepository';
import { DrizzleWebhookRepository } from '../src/infrastructure/repositories/DrizzleWebhookRepository';

export const testRepositories = {
  formRepository: new DrizzleFormRepository(testDb as any),
  testimonialRepository: new DrizzleTestimonialRepository(testDb as any),
  apiKeyRepository: new DrizzleApiKeyRepository(testDb as any),
  userRepository: new DrizzleUserRepository(testDb as any),
  webhookRepository: new DrizzleWebhookRepository(testDb as any),
};
