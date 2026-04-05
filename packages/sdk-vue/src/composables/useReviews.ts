import { ref, watchEffect } from 'vue';
import { reviewsApi } from '../api/reviews';
import { mapReviews } from '../api/mappers/review.mapper';
import { ReviewApiParams, Review } from '../types';

export const useReviews = (params: ReviewApiParams) => {
  const data = ref<{ reviews: Review[] } | null>(null);
  const isLoading = ref(true);
  const error = ref<any>(null);
  // Incrementing this ref forces watchEffect to re-run on manual refetch.
  const refreshTick = ref(0);

  // watchEffect auto-tracks every reactive property read inside (including
  // reactive params fields and refreshTick), and re-runs when they change.
  // onCleanup replaces onMounted + onUnmounted + deep watch entirely.
  watchEffect((onCleanup) => {
    void refreshTick.value; // track for manual refetch

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
