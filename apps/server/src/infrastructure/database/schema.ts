import { pgTable, uuid, text, timestamp, boolean, jsonb, integer, index, unique } from 'drizzle-orm/pg-core';

// ═══════════════════════════════════════
// USERS & AUTH (Better-auth)
// ═══════════════════════════════════════

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  isSystemAdmin: boolean('is_system_admin').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').unique().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verifications = pgTable('verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ═══════════════════════════════════════
// ORGANIZATIONS & MEMBERSHIP
// ═══════════════════════════════════════

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  logo: text('logo'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const members = pgTable('members', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('member'), // owner | admin | editor | viewer
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  unq: unique().on(t.userId, t.organizationId),
}));

export const invitations = pgTable('invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role').notNull().default('member'),
  status: text('status').notNull().default('pending'), // pending | accepted | rejected | expired
  expiresAt: timestamp('expires_at').notNull(),
  inviterId: uuid('inviter_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ═══════════════════════════════════════
// PROJECTS & API KEYS
// ═══════════════════════════════════════

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  settings: jsonb('settings').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  key: text('key').unique().notNull(),
  type: text('type').notNull(), // public | secret
  name: text('name'),
  lastUsed: timestamp('last_used'),
  expiresAt: timestamp('expires_at'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => ({
  keyIdx: index('idx_api_keys_key').on(t.key),
}));

// ═══════════════════════════════════════
// FORMS
// ═══════════════════════════════════════

export const forms = pgTable('forms', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  thankYouMessage: text('thank_you_message'),
  config: jsonb('config').default({}),
  accentColor: text('accent_color'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
  projectIdx: index('idx_forms_project').on(t.projectId),
}));

// ═══════════════════════════════════════
// TESTIMONIALS & MEDIA
// ═══════════════════════════════════════

export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  uploadId: text('upload_id').unique().notNull(),
  originalFilename: text('original_filename').notNull(),
  originalSize: integer('original_size').notNull(), 
  mimeType: text('mime_type').notNull(),
  processedUrls: jsonb('processed_urls').default({}),
  processingStatus: text('processing_status').default('pending'),
  transcript: text('transcript'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const testimonials = pgTable('testimonials', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  formId: uuid('form_id').references(() => forms.id, { onDelete: 'set null' }),
  type: text('type').notNull().default('text'), // text | video
  status: text('status').notNull().default('pending'), // pending | approved | rejected
  source: text('source').notNull().default('form'), // form | import | api
  content: text('content').notNull(),
  rating: integer('rating'),
  authorName: text('author_name').notNull(),
  authorEmail: text('author_email'),
  authorTitle: text('author_title'),
  authorUrl: text('author_url'),
  mediaId: uuid('media_id').references(() => media.id, { onDelete: 'set null' }),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
  projectIdx: index('idx_testimonials_project').on(t.projectId),
  statusIdx: index('idx_testimonials_status').on(t.status),
  formIdx: index('idx_testimonials_form').on(t.formId),
}));

// ═══════════════════════════════════════
// WEBHOOKS
// ═══════════════════════════════════════

export const webhooks = pgTable('webhooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  events: text('events').array().notNull(), 
  secret: text('secret').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const webhookLogs = pgTable('webhook_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  webhookId: uuid('webhook_id').notNull().references(() => webhooks.id, { onDelete: 'cascade' }),
  event: text('event').notNull(),
  payload: jsonb('payload').notNull(),
  responseStatus: integer('response_status'),
  responseBody: text('response_body'),
  attempt: integer('attempt').default(1),
  delivered: boolean('delivered').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => ({
  webhookIdx: index('idx_webhook_logs_webhook').on(t.webhookId),
  deliveredIdx: index('idx_webhook_logs_delivered').on(t.delivered),
}));
