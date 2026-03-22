export interface ReviewApiParams {
  formId: string;
  page?: number;
  limit?: number;
  minRating?: number;
}

export interface RawReview {
  id: string;
  content: string;
  rating: number;
  authorName: string;
  authorEmail?: string;
  authorTitle?: string;
  authorUrl?: string;
  metadata?: Record<string, any>;
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
