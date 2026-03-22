import { ref, onMounted, watch } from 'vue';
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

  const fetchPage = async (page: number, isInitial = false) => {
    if (isInitial) {
      isLoading.value = true;
    } else {
      isFetchingNextPage.value = true;
    }
    
    error.value = null;

    try {
      const response = await reviewsApi.getReviews({
        ...params,
        page,
      });

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
      error.value = err;
    } finally {
      isLoading.value = false;
      isFetchingNextPage.value = false;
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

  // Re-fetch everything if params change
  watch(
    () => params,
    () => {
      fetchPage(1, true);
    },
    { deep: true }
  );

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
