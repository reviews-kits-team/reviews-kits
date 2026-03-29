import { ReviewApiParams, ReviewApiResponse } from '../types';
import { buildQueryString } from '../utils/buildQuery';
import { apiClient } from './client';

export const reviewsApi = {
  getReviews: async (
    params: ReviewApiParams,
    options?: RequestInit
  ): Promise<ReviewApiResponse> => {
    const query = buildQueryString(params);
    return apiClient.get<ReviewApiResponse>(
      `/api/v1/public/reviews${query}`,
      options
    );
  },
};
