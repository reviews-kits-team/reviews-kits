import { useInfiniteQuery } from '@tanstack/vue-query';
import { reviewsApi } from '../api/reviews';
import { mapReviews } from '../api/mappers/review.mapper';
import { QUERY_KEYS } from '../core/queryKeys';
import { ReviewApiParams } from '../types';

export const useInfiniteReviews = (params: Omit<ReviewApiParams, 'page'> = {}) => {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEYS.REVIEWS, 'infinite', params],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await reviewsApi.getReviews({
        ...params,
        page: pageParam as number,
      });
      return {
        reviews: mapReviews(response.data),
        meta: response.meta,
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  return {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
};
