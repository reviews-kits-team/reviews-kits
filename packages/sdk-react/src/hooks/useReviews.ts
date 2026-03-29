import { useState, useEffect, useCallback } from 'react';
import { reviewsApi } from '../api/reviews';
import { mapReviews } from '../api/mappers/review.mapper';
import type { ReviewApiParams, Review } from '../types';
import { useReviewsKitConfig } from '../context/ReviewsKitProvider';

export function useReviews(params: ReviewApiParams) {
  const config = useReviewsKitConfig();
  const [data, setData] = useState<{ reviews: Review[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchReviews = useCallback(
    async (signal?: AbortSignal) => {
      if (!config) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await reviewsApi.getReviews(params, { signal }, config);
        if (signal?.aborted) return;
        setData({
          reviews: mapReviews(response.data),
        });
      } catch (err: any) {
        if (err.name === 'AbortError' || (err instanceof Error && err.name === 'AbortError')) {
          return;
        }
        setError(err);
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [config, JSON.stringify(params)]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchReviews(controller.signal);
    return () => controller.abort();
  }, [fetchReviews]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchReviews,
  };
}
