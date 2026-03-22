export interface ReviewApiParams {
  page?: number;
  limit?: number;
  minRating?: number;
}

export interface RawReview {
  id: string;
  content: string;
  rating: number;
  author_name: string;
  author_email?: string;
  author_title?: string;
  author_url?: string;
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
