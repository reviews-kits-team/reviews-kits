import { db } from './database/db';
import { DrizzleFormRepository } from './repositories/DrizzleFormRepository';
import { DrizzleTestimonialRepository } from './repositories/DrizzleTestimonialRepository';
import { DrizzleApiKeyRepository } from './repositories/DrizzleApiKeyRepository';
import { DrizzleUserRepository } from './repositories/DrizzleUserRepository';

import { GenerateUserApiKeys } from '../application/use-cases/api-keys/GenerateUserApiKeys';
import { VerifyApiKey } from '../application/use-cases/api-keys/VerifyApiKey';
import { GetDashboardStats } from '../application/use-cases/dashboard/GetDashboardStats';

// User Use Cases
import { UpdateUserUseCase } from '../application/use-cases/user/UpdateUserUseCase';

// Testimonials Use Cases
import { UpdateTestimonialStatusUseCase } from '../application/use-cases/testimonials/UpdateTestimonialStatusUseCase';
import { BatchUpdateTestimonialStatusUseCase } from '../application/use-cases/testimonials/BatchUpdateTestimonialStatusUseCase';
import { ReorderTestimonialsUseCase } from '../application/use-cases/testimonials/ReorderTestimonialsUseCase';

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

// Use Case Instances
const generateUserApiKeys = new GenerateUserApiKeys(apiKeyRepository);
const verifyApiKey = new VerifyApiKey(apiKeyRepository);
const getDashboardStats = new GetDashboardStats(testimonialRepository);

const updateUserUseCase = new UpdateUserUseCase(userRepository);

const updateTestimonialStatusUseCase = new UpdateTestimonialStatusUseCase(testimonialRepository);
const batchUpdateTestimonialStatusUseCase = new BatchUpdateTestimonialStatusUseCase(testimonialRepository);
const reorderTestimonialsUseCase = new ReorderTestimonialsUseCase(testimonialRepository);

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
const submitReviewUseCase = new SubmitReviewUseCase(testimonialRepository, formRepository);
const getPublicFormUseCase = new GetPublicFormUseCase(formRepository);

export const container = {
  formRepository,
  testimonialRepository,
  apiKeyRepository,
  userRepository,
  
  // Use Cases
  generateUserApiKeys,
  verifyApiKey,
  getDashboardStats,
  
  updateUserUseCase,
  
  updateTestimonialStatusUseCase,
  batchUpdateTestimonialStatusUseCase,
  reorderTestimonialsUseCase,
  
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
