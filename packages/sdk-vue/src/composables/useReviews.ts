import { useQuery } from '@tanstack/vue-query';
import { reviewsApi } from '../api/reviews';
import { mapReviews } from '../api/mappers/review.mapper';
import { QUERY_KEYS } from '../core/queryKeys';
import { ReviewApiParams } from '../types';

export const useReviews = (params: ReviewApiParams) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QUERY_KEYS.REVIEWS, params],
    queryFn: async () => {
      const response = await reviewsApi.getReviews(params);
      return {
        reviews: mapReviews(response.data),
        meta: response.meta,
      };
    },
  });

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};
