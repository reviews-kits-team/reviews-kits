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

  const fetchReviews = useCallback(async () => {
    if (!config) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await reviewsApi.getReviews(params, config);
      setData({
        reviews: mapReviews(response.data),
      });
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [config, JSON.stringify(params)]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchReviews,
  };
}
