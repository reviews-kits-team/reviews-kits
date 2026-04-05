import { useState, useEffect, useCallback, useMemo } from 'react';
import { reviewsApi, mapReviews } from '@reviewskits/core';
import type { ReviewApiParams, Review } from '../types';
import { useReviewsKitConfig } from '../context/ReviewsKitProvider';

export function useReviews(params: ReviewApiParams) {
  const config = useReviewsKitConfig();
  const [data, setData] = useState<{ reviews: Review[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Stabilize params: new reference only when values actually change.
  // JSON.stringify is intentional here — used in useMemo deps, not in
  // useCallback deps, so it pays the serialization cost only once per
  // params change rather than on every render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableParams = useMemo(() => params, [JSON.stringify(params)]);

  const fetchReviews = useCallback(
    async (signal?: AbortSignal) => {
      if (!config) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await reviewsApi.getReviews(stableParams, { signal }, config);
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
    [config, stableParams]
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
