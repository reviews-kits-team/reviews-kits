import { useState, useEffect, useCallback, useMemo } from 'react';
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableParams = useMemo(() => params, [JSON.stringify(params)]);

  const fetchPage = useCallback(
    async (page: number, isInitial = false, signal?: AbortSignal) => {
      if (!config) return;

      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsFetchingNextPage(true);
      }

      setError(null);

      try {
        const response = await reviewsApi.getReviews(
          {
            ...stableParams,
            page,
          },
          { signal },
          config
        );

        if (signal?.aborted) return;

        const newPage = {
          reviews: mapReviews(response.data),
          meta: response.meta,
        };

        if (isInitial) {
          setData({ pages: [newPage] });
        } else {
          setData((prev: InfiniteData) => ({
            pages: [...prev.pages, newPage],
          }));
        }

        setHasNextPage(response.meta.page < response.meta.totalPages);
        setCurrentPage(response.meta.page);
      } catch (err: any) {
        if (err.name === 'AbortError' || (err instanceof Error && err.name === 'AbortError')) {
          return;
        }
        setError(err);
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
          setIsFetchingNextPage(false);
        }
      }
    },
    [config, stableParams]
  );

  const fetchNextPage = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchPage(currentPage + 1);
    }
  }, [hasNextPage, isFetchingNextPage, currentPage, fetchPage]);

  const refetch = useCallback(() => fetchPage(1, true), [fetchPage]);

  useEffect(() => {
    const controller = new AbortController();
    fetchPage(1, true, controller.signal);
    return () => controller.abort();
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
