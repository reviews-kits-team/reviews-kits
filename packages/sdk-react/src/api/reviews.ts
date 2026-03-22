import type { ReviewApiParams, ReviewApiResponse } from '../types';
import { buildQueryString } from '../utils/buildQuery';
import { apiClient } from './client';
import type { ReviewsKitConfig } from '../core/config';

export const reviewsApi = {
  getReviews: async (params: ReviewApiParams, config?: ReviewsKitConfig): Promise<ReviewApiResponse> => {
    const query = buildQueryString(params);
    return apiClient.get<ReviewApiResponse>(`/api/v1/public/reviews${query}`, {}, config);
  },
};
