// ─── Back-end model types ─────────────────────────────────────────────────────

export type TestimonialStatus = 'pending' | 'approved' | 'rejected';
export type TestimonialSource = 'form' | 'import' | 'api';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface Testimonial {
  id: string;
  content: string;
  rating?: number;
  status: TestimonialStatus;
  source: TestimonialSource;
  author: {
    name: string;
    email?: string;
    title?: string;
  };
  consent_public: boolean;
  consent_internal: boolean;
  consented_at: Date | null;
  created_at: Date;
}

export interface Form {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: Date;
}


// ─── Caching types ────────────────────────────────────────────────────────────

export interface CacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number, tags?: string[]): Promise<void>;
  delete(key: string): Promise<void>;
  invalidateTags(tags: string[]): Promise<void>;
}

export interface CacheConfig {
  /** Time to live in seconds. Default is 300 (5 minutes) */
  ttl?: number;
  /** Custom cache adapter implementation. Defaults to memory cache. */
  adapter?: CacheAdapter;
  /** Whether caching is enabled. Default is true. */
  enabled?: boolean;
}

// ─── SDK shared types ─────────────────────────────────────────────────────────

/**
 * Configuration passed when initialising a Reviewskits SDK.
 */
export interface ReviewsKitConfig {
  /** Your Reviewskits host URL (e.g. https://api.reviewskits.com) */
  host: string;
  /** Your public API key (pk_…) */
  pk: string;
  /** Enable or configure caching. Defaults to true. */
  cache?: boolean | CacheConfig;
}

/**
 * The shape of a review author as returned by the SDK.
 */
export interface ReviewAuthor {
  name: string;
  email?: string;
  title?: string;
  url?: string;
}

/**
 * A fully-mapped review object ready to be used in your UI.
 */
export interface Review {
  id: string;
  content: string;
  rating: number;
  author: ReviewAuthor;
  /** ISO 8601 date string */
  createdAt: string;
  /** Source platform (e.g. "google", "direct") */
  source: string;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters accepted by the reviews endpoint.
 */
export interface ReviewApiParams {
  formId: string;
  page?: number;
  limit?: number;
  minRating?: number;
}

/**
 * Raw review shape returned directly by the API (before mapping).
 */
export interface RawReview {
  id: string;
  content: string;
  rating: number;
  authorName: string;
  authorEmail?: string;
  authorTitle?: string;
  authorUrl?: string;
  createdAt: string;
  type: string;
  consentPublic: boolean;
  consentInternal: boolean;
  consentedAt?: string | null;
  metadata?: Record<string, unknown>;
}

export interface ReviewApiResponseMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReviewApiResponse {
  data: RawReview[];
  meta: ReviewApiResponseMeta;
}