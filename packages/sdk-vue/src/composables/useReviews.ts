import { ref, watchEffect } from 'vue';
import { reviewsApi } from '../api/reviews';
import { mapReviews } from '../api/mappers/review.mapper';
import { ReviewApiParams, Review } from '../types';

export const useReviews = (params: ReviewApiParams) => {
  const config = inject(InjectionKey, undefined);
  const data = ref<{ reviews: Review[] } | null>(null);
  const isLoading = ref(true);
  const error = ref<any>(null);
  // Incrementing this ref forces watchEffect to re-run on manual refetch.
  const refreshTick = ref(0);

  const fetchReviews = async (signal?: AbortSignal) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await reviewsApi.getReviews(params, { signal }, config);
      if (signal?.aborted) return;

      data.value = {
        reviews: mapReviews(response.data),
      };
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      error.value = err;
    } finally {
      if (!signal?.aborted) {
        isLoading.value = false;
      }
    }
  };

    const controller = new AbortController();
    onCleanup(() => controller.abort());

    isLoading.value = true;
    error.value = null;

    reviewsApi
      .getReviews({ ...params }, { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return;
        data.value = { reviews: mapReviews(response.data) };
      })
      .catch((err: any) => {
        if (err.name === 'AbortError') return;
        error.value = err;
      })
      .finally(() => {
        if (!controller.signal.aborted) isLoading.value = false;
      });
  });

  return {
    data,
    isLoading,
    error,
    refetch: () => { refreshTick.value++ },
  };
};
