import { db } from './database/db';
import { DrizzleFormRepository } from './repositories/DrizzleFormRepository';
import { DrizzleTestimonialRepository } from './repositories/DrizzleTestimonialRepository';
import { DrizzleApiKeyRepository } from './repositories/DrizzleApiKeyRepository';
import { GenerateUserApiKeys } from '../application/use-cases/api-keys/GenerateUserApiKeys';
import { VerifyApiKey } from '../application/use-cases/api-keys/VerifyApiKey';

// Repositories
const formRepository = new DrizzleFormRepository(db);
const testimonialRepository = new DrizzleTestimonialRepository(db);
const apiKeyRepository = new DrizzleApiKeyRepository(db);

// Use Cases
const generateUserApiKeys = new GenerateUserApiKeys(apiKeyRepository);
const verifyApiKey = new VerifyApiKey(apiKeyRepository);

export const container = {
  formRepository,
  testimonialRepository,
  apiKeyRepository,
  generateUserApiKeys,
  verifyApiKey,
};
