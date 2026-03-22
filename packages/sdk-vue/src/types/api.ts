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

export interface ReviewApiResponse {
  data: RawReview[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
