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
  created_at: Date;
}

export interface Form {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: Date;
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