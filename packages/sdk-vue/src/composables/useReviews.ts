import { ref, watch, onMounted } from 'vue';
import { reviewsApi } from '../api/reviews';
import { mapReviews } from '../api/mappers/review.mapper';
import { ReviewApiParams, Review } from '../types';

export const useReviews = (params: ReviewApiParams) => {
  const data = ref<{ reviews: Review[] } | null>(null);
  const isLoading = ref(true);
  const error = ref<any>(null);

  const fetchReviews = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await reviewsApi.getReviews(params);
      data.value = {
        reviews: mapReviews(response.data),
      };
    } catch (err: any) {
      error.value = err;
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    fetchReviews();
  });

  // Re-fetch when params change
  watch(
    () => params,
    () => {
      fetchReviews();
    },
    { deep: true }
  );

  return {
    data,
    isLoading,
    error,
    refetch: fetchReviews,
  };
};
