import { db } from './database/db';
import { DrizzleFormRepository } from './repositories/DrizzleFormRepository';
import { DrizzleTestimonialRepository } from './repositories/DrizzleTestimonialRepository';
import { DrizzleApiKeyRepository } from './repositories/DrizzleApiKeyRepository';
import { DrizzleUserRepository } from './repositories/DrizzleUserRepository';
import { DrizzleWebhookRepository } from './repositories/DrizzleWebhookRepository';

import { WebhookService } from '../application/services/WebhookService';

import { GenerateUserApiKeys } from '../application/use-cases/api-keys/GenerateUserApiKeys';
import { RotateApiKeysUseCase } from '../application/use-cases/api-keys/RotateApiKeysUseCase';
import { RecordApiKeyUsageUseCase } from '../application/use-cases/api-keys/RecordApiKeyUsageUseCase';
import { VerifyApiKey } from '../application/use-cases/api-keys/VerifyApiKey';
import { VerifyPublicApiKeyUseCase } from '../application/use-cases/api-keys/VerifyPublicApiKeyUseCase';
import { CreateWebhookUseCase } from '../application/use-cases/webhooks/CreateWebhookUseCase';
import { ListWebhooksUseCase } from '../application/use-cases/webhooks/ListWebhooksUseCase';
import { DeleteWebhookUseCase } from '../application/use-cases/webhooks/DeleteWebhookUseCase';
import { TestWebhookUseCase } from '../application/use-cases/webhooks/TestWebhookUseCase';
import { GetDashboardStats } from '../application/use-cases/dashboard/GetDashboardStats';

// User Use Cases
import { UpdateUserUseCase } from '../application/use-cases/user/UpdateUserUseCase';

// Testimonials Use Cases
import { GetTestimonialByIdUseCase } from '../application/use-cases/testimonials/GetTestimonialByIdUseCase';
import { UpdateTestimonialStatusUseCase } from '../application/use-cases/testimonials/UpdateTestimonialStatusUseCase';
import { BatchUpdateTestimonialStatusUseCase } from '../application/use-cases/testimonials/BatchUpdateTestimonialStatusUseCase';
import { ReorderTestimonialsUseCase } from '../application/use-cases/testimonials/ReorderTestimonialsUseCase';
import { ExportTestimonialsUseCase } from '../application/use-cases/testimonials/ExportTestimonialsUseCase';
import { ImportTestimonialsUseCase } from '../application/use-cases/testimonials/ImportTestimonialsUseCase';

// Forms Use Cases
import { ListFormsUseCase } from '../application/use-cases/forms/ListFormsUseCase';
import { CreateFormUseCase } from '../application/use-cases/forms/CreateFormUseCase';
import { GetFormDetailsUseCase } from '../application/use-cases/forms/GetFormDetailsUseCase';
import { UpdateFormUseCase } from '../application/use-cases/forms/UpdateFormUseCase';
import { DeleteFormUseCase } from '../application/use-cases/forms/DeleteFormUseCase';
import { ToggleFormStatusUseCase } from '../application/use-cases/forms/ToggleFormStatusUseCase';
import { DuplicateFormUseCase } from '../application/use-cases/forms/DuplicateFormUseCase';
import { BatchToggleFormStatusUseCase } from '../application/use-cases/forms/BatchToggleFormStatusUseCase';
import { BatchDeleteFormsUseCase } from '../application/use-cases/forms/BatchDeleteFormsUseCase';
import { GetFormStatsUseCase } from '../application/use-cases/forms/GetFormStatsUseCase';
import { GetFormTestimonialsUseCase } from '../application/use-cases/forms/GetFormTestimonialsUseCase';

// Public Reviews Use Cases
import { GetPublicReviewsUseCase } from '../application/use-cases/public-reviews/GetPublicReviewsUseCase';
import { SubmitReviewUseCase } from '../application/use-cases/public-reviews/SubmitReviewUseCase';
import { GetPublicFormUseCase } from '../application/use-cases/public-reviews/GetPublicFormUseCase';

// Repositories
const formRepository = new DrizzleFormRepository(db as any);
const testimonialRepository = new DrizzleTestimonialRepository(db as any);
const apiKeyRepository = new DrizzleApiKeyRepository(db as any);
const userRepository = new DrizzleUserRepository(db as any);
const webhookRepository = new DrizzleWebhookRepository(db as any);

// Services
const webhookService = new WebhookService(webhookRepository);

// Use Case Instances
const generateUserApiKeys = new GenerateUserApiKeys(apiKeyRepository);
const rotateApiKeysUseCase = new RotateApiKeysUseCase(apiKeyRepository);
const recordApiKeyUsageUseCase = new RecordApiKeyUsageUseCase(apiKeyRepository);
const verifyApiKey = new VerifyApiKey(apiKeyRepository);
const verifyPublicApiKeyUseCase = new VerifyPublicApiKeyUseCase(apiKeyRepository);
const createWebhookUseCase = new CreateWebhookUseCase(webhookRepository);
const listWebhooksUseCase = new ListWebhooksUseCase(webhookRepository);
const deleteWebhookUseCase = new DeleteWebhookUseCase(webhookRepository);
const testWebhookUseCase = new TestWebhookUseCase(webhookRepository, webhookService);
const getDashboardStats = new GetDashboardStats(testimonialRepository);

const updateUserUseCase = new UpdateUserUseCase(userRepository);

const getTestimonialByIdUseCase = new GetTestimonialByIdUseCase(testimonialRepository);
const updateTestimonialStatusUseCase = new UpdateTestimonialStatusUseCase(testimonialRepository);
const batchUpdateTestimonialStatusUseCase = new BatchUpdateTestimonialStatusUseCase(testimonialRepository);
const reorderTestimonialsUseCase = new ReorderTestimonialsUseCase(testimonialRepository);
const exportTestimonialsUseCase = new ExportTestimonialsUseCase(testimonialRepository, formRepository);
const importTestimonialsUseCase = new ImportTestimonialsUseCase(testimonialRepository, formRepository);

const listFormsUseCase = new ListFormsUseCase(formRepository, testimonialRepository);
const createFormUseCase = new CreateFormUseCase(formRepository);
const getFormDetailsUseCase = new GetFormDetailsUseCase(formRepository, testimonialRepository);
const updateFormUseCase = new UpdateFormUseCase(formRepository);
const deleteFormUseCase = new DeleteFormUseCase(formRepository);
const toggleFormStatusUseCase = new ToggleFormStatusUseCase(formRepository);
const duplicateFormUseCase = new DuplicateFormUseCase(formRepository);
const batchToggleFormStatusUseCase = new BatchToggleFormStatusUseCase(formRepository);
const batchDeleteFormsUseCase = new BatchDeleteFormsUseCase(formRepository);
const getFormStatsUseCase = new GetFormStatsUseCase(formRepository, testimonialRepository);
const getFormTestimonialsUseCase = new GetFormTestimonialsUseCase(formRepository, testimonialRepository);

const getPublicReviewsUseCase = new GetPublicReviewsUseCase(testimonialRepository, formRepository);
const submitReviewUseCase = new SubmitReviewUseCase(testimonialRepository, formRepository, webhookService);
const getPublicFormUseCase = new GetPublicFormUseCase(formRepository);

export const container = {
  // Services
  webhookService,
  
  // Use Cases
  generateUserApiKeys,
  rotateApiKeysUseCase,
  recordApiKeyUsageUseCase,
  verifyApiKey,
  verifyPublicApiKeyUseCase,
  createWebhookUseCase,
  listWebhooksUseCase,
  deleteWebhookUseCase,
  testWebhookUseCase,
  getDashboardStats,
  
  updateUserUseCase,
  
  getTestimonialByIdUseCase,
  updateTestimonialStatusUseCase,
  batchUpdateTestimonialStatusUseCase,
  reorderTestimonialsUseCase,
  exportTestimonialsUseCase,
  importTestimonialsUseCase,
  
  listFormsUseCase,
  createFormUseCase,
  getFormDetailsUseCase,
  updateFormUseCase,
  deleteFormUseCase,
  toggleFormStatusUseCase,
  duplicateFormUseCase,
  batchToggleFormStatusUseCase,
  batchDeleteFormsUseCase,
  getFormStatsUseCase,
  getFormTestimonialsUseCase,
  
  getPublicReviewsUseCase,
  submitReviewUseCase,
  getPublicFormUseCase,
};
