import { pgTable, uuid, text, timestamp, boolean, jsonb, integer, index, unique, date } from 'drizzle-orm/pg-core';

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
  notificationPrefs: jsonb('notification_prefs').default({ newReview: true, weeklyReport: true }),
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
// API KEYS
// ═══════════════════════════════════════

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  keyHash: text('key_hash').unique().notNull(),
  keyPrefix: text('key_prefix').notNull(),
  type: text('type').notNull(), // public | secret
  name: text('name'),
  lastUsed: timestamp('last_used'),
  expiresAt: timestamp('expires_at'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => ({
  hashIdx: index('idx_api_keys_hash').on(t.keyHash),
  userIdIdx: index('idx_api_keys_user').on(t.userId),
}));

// ═══════════════════════════════════════
// FORMS
// ═══════════════════════════════════════

export const forms = pgTable('forms', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  publicId: text('public_id').unique().notNull(),
  description: text('description'),
  thankYouMessage: text('thank_you_message'),
  config: jsonb('config').default({}),
  accentColor: text('accent_color'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
  userIdIdx: index('idx_forms_user').on(t.userId),
}));

// ═══════════════════════════════════════
// TESTIMONIALS & MEDIA
// ═══════════════════════════════════════

export const formVisits = pgTable('form_visits', {
  id: uuid('id').primaryKey().defaultRandom(),
  formId: uuid('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  visits: integer('visits').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
  formDateUnq: unique('unq_form_visits_date').on(t.formId, t.date),
  formIdx: index('idx_form_visits_form').on(t.formId),
  dateIdx: index('idx_form_visits_date').on(t.date),
}));

export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
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
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
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
  position: integer('position').notNull().default(0),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
  userIdIdx: index('idx_testimonials_user').on(t.userId),
  statusIdx: index('idx_testimonials_status').on(t.status),
  formIdx: index('idx_testimonials_form').on(t.formId),
}));

// ═══════════════════════════════════════
// WEBHOOKS
// ═══════════════════════════════════════

export const webhooks = pgTable('webhooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
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
// ═══════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // new_review
  title: text('title').notNull(),
  body: text('body'),
  formId: uuid('form_id').references(() => forms.id, { onDelete: 'set null' }),
  testimonialId: uuid('testimonial_id').references(() => testimonials.id, { onDelete: 'set null' }),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  userIdx: index('idx_notifications_user').on(t.userId),
  unreadIdx: index('idx_notifications_unread').on(t.userId, t.isRead),
}));

// ═══════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════

export const rateLimits = pgTable('rate_limits', {
  key: text('key').primaryKey(),
  count: integer('count').notNull().default(0),
  resetAt: timestamp('reset_at').notNull(),
});
