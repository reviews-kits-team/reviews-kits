import { ref, watch, onMounted, onUnmounted, inject } from 'vue';
import { reviewsApi, mapReviews } from '@reviewskits/core';
import type { ReviewApiParams, Review } from '@reviewskits/core';
import { InjectionKey } from '../core/config';

export const useReviews = (params: ReviewApiParams) => {
  const config = inject(InjectionKey, undefined);
  const data = ref<{ reviews: Review[] } | null>(null);
  const isLoading = ref(true);
  const error = ref<any>(null);
  let controller: AbortController | null = null;

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

  const executeFetch = () => {
    if (controller) controller.abort();
    controller = new AbortController();
    fetchReviews(controller.signal);
  };

  onMounted(() => {
    executeFetch();
  });

  onUnmounted(() => {
    if (controller) controller.abort();
  });

  // Re-fetch when params change
  watch(
    () => params,
    () => {
      executeFetch();
    },
    { deep: true }
  );

  return {
    data,
    isLoading,
    error,
    refetch: executeFetch,
  };
};
