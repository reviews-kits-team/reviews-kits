import type { ReviewApiParams, ReviewApiResponse } from '@reviewskits/types';
import { buildQueryString } from '../utils/buildQuery';
import { apiClient } from './client';
import type { ReviewsKitConfig } from '@reviewskits/types';

export const reviewsApi = {
  getReviews: async (
    params: ReviewApiParams,
    options?: RequestInit,
    config?: ReviewsKitConfig
  ): Promise<ReviewApiResponse> => {
    const query = buildQueryString(params);
    const tags = params.formId ? [`reviews:${params.formId}`] : [];
    
    return apiClient.get<ReviewApiResponse>(
      `/api/v1/public/reviews${query}`,
      options,
      config,
      tags
    );
  },
};
