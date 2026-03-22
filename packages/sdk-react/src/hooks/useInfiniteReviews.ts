import { useState, useEffect, useCallback } from 'react';
import { reviewsApi } from '../api/reviews';
import { mapReviews } from '../api/mappers/review.mapper';
import type { ReviewApiParams, Review, ReviewApiResponseMeta } from '../types';
import { useReviewsKitConfig } from '../context/ReviewsKitProvider';

export interface InfiniteData {
  pages: {
    reviews: Review[];
    meta: ReviewApiResponseMeta;
  }[];
}

export function useInfiniteReviews(params: Omit<ReviewApiParams, 'page'>) {
  const config = useReviewsKitConfig();
  const [data, setData] = useState<InfiniteData>({ pages: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [error, setError] = useState<any>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPage = useCallback(async (page: number, isInitial = false) => {
    if (!config) return;

    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsFetchingNextPage(true);
    }
    
    setError(null);

    try {
      const response = await reviewsApi.getReviews({
        ...params,
        page,
      }, config);

      const newPage = {
        reviews: mapReviews(response.data),
        meta: response.meta,
      };

      if (isInitial) {
        setData({ pages: [newPage] });
      } else {
        setData((prev: InfiniteData) => ({
          pages: [...prev.pages, newPage]
        }));
      }

      setHasNextPage(response.meta.page < response.meta.totalPages);
      setCurrentPage(response.meta.page);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetchingNextPage(false);
    }
  }, [config, JSON.stringify(params)]);

  const fetchNextPage = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchPage(currentPage + 1);
    }
  }, [hasNextPage, isFetchingNextPage, currentPage, fetchPage]);

  const refetch = useCallback(() => fetchPage(1, true), [fetchPage]);

  useEffect(() => {
    fetchPage(1, true);
  }, [fetchPage]);

  return {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
}
