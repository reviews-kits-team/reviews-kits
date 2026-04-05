import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { reviewsApi } from '../api/reviews';
import { mapReviews } from '../api/mappers/review.mapper';
import { ReviewApiParams, Review, ReviewApiResponseMeta } from '../types';

export interface InfiniteData {
  pages: {
    reviews: Review[];
    meta: ReviewApiResponseMeta;
  }[];
}

export const useInfiniteReviews = (params: Omit<ReviewApiParams, 'page'>) => {
  const data = ref<InfiniteData>({ pages: [] });
  const isLoading = ref(true);
  const isFetchingNextPage = ref(false);
  const error = ref<any>(null);
  const hasNextPage = ref(false);
  const currentPage = ref(1);
  let controller: AbortController | null = null;

  const fetchPage = async (page: number, isInitial = false) => {
    if (isInitial) {
      if (controller) controller.abort();
      controller = new AbortController();
      isLoading.value = true;
    } else {
      isFetchingNextPage.value = true;
    }
    
    const signal = controller?.signal;
    error.value = null;

    try {
      const response = await reviewsApi.getReviews({
        ...params,
        page,
      }, { signal });

      if (signal?.aborted) return;

      const newPage = {
        reviews: mapReviews(response.data),
        meta: response.meta,
      };

      if (isInitial) {
        data.value.pages = [newPage];
      } else {
        data.value.pages.push(newPage);
      }

      hasNextPage.value = response.meta.page < response.meta.totalPages;
      currentPage.value = response.meta.page;
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      error.value = err;
    } finally {
      if (!signal?.aborted) {
        if (isInitial) {
          isLoading.value = false;
        } else {
          isFetchingNextPage.value = false;
        }
      }
    }
  };

  const fetchNextPage = async () => {
    if (hasNextPage.value && !isFetchingNextPage.value) {
      await fetchPage(currentPage.value + 1);
    }
  };

  const refetch = () => fetchPage(1, true);

  onMounted(() => {
    fetchPage(1, true);
  });

  onUnmounted(() => {
    if (controller) controller.abort();
  });

  // Serialize params to a string so Vue compares values, not object identity.
  // Avoids deep: true which traverses the whole object tree every tick.
  const serializedParams = computed(() => JSON.stringify(params));
  watch(serializedParams, () => {
    fetchPage(1, true);
  });

  return {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
};
