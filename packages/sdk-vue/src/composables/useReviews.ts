import { ref, onMounted } from 'vue';
import type { Testimonial } from '@reviewskits/types';

export interface UseReviewsOptions {
  host: string;
  formSlug?: string;
  limit?: number;
}

export function useReviews(options: UseReviewsOptions) {
  const data = ref<Testimonial[]>([]);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  onMounted(() => {
    console.log('useReviews composable initialized with host:', options.host);
  });

  return { data, isLoading, error };
}
