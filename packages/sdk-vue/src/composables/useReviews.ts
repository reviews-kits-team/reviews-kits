import { ref, watchEffect, inject } from 'vue';
import { reviewsApi, mapReviews } from '@reviewskits/core';
import { ReviewApiParams, Review } from '../types';
import { InjectionKey } from '../core/config';

export const useReviews = (params: ReviewApiParams) => {
  const config = inject(InjectionKey, undefined);
  const data = ref<{ reviews: Review[] } | null>(null);
  const isLoading = ref(true);
  const error = ref<any>(null);
  // Incrementing this ref forces watchEffect to re-run on manual refetch.
  const refreshTick = ref(0);

  watchEffect((onCleanup) => {
    refreshTick.value; // Force dependency tracking
    const controller = new AbortController();
    onCleanup(() => controller.abort());

    isLoading.value = true;
    error.value = null;

    reviewsApi
      .getReviews({ ...params }, { signal: controller.signal }, config)
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
