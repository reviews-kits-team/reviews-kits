/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { useReviews } from '../useReviews';
import { reviewsApi } from '../../api/reviews';
import { reactive, nextTick, defineComponent } from 'vue';
import { mount } from '@vue/test-utils';

vi.mock('../../api/reviews', () => ({
  reviewsApi: {
    getReviews: vi.fn(),
  },
}));

const TestComponent = defineComponent({
  props: {
    params: { type: Object, required: true }
  },
  setup(props) {
    const { data, isLoading, error } = useReviews(props.params as any);
    return { data, isLoading, error };
  },
  template: '<div></div>'
});

describe('useReviews Stale Closures & Cancellation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should cancel previous request when params change', async () => {
    let abortSignal: AbortSignal | undefined;
    
    (reviewsApi.getReviews as Mock).mockImplementation((_params: any, options?: RequestInit) => {
      abortSignal = options?.signal ?? undefined;
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: [], meta: { page: 1, totalPages: 1 } });
        }, 100);
      });
    });

    const params = reactive({ formId: '1' });
    mount(TestComponent, {
      props: { params }
    });

    expect(reviewsApi.getReviews).toHaveBeenCalledTimes(1);
    const firstSignal = abortSignal;

    params.formId = '2';
    await nextTick();

    expect(reviewsApi.getReviews).toHaveBeenCalledTimes(2);
    expect(firstSignal?.aborted).toBe(true);
  });

  it('should ignore results from aborted requests', async () => {
    let resolveFirst: any;
    const firstPromise = new Promise((resolve) => {
      resolveFirst = resolve;
    });

    (reviewsApi.getReviews as Mock)
      .mockReturnValueOnce(firstPromise)
      .mockResolvedValueOnce({ data: [{ id: '2' }], meta: { page: 1, totalPages: 1 } });

    const params = reactive({ formId: '1' });
    const wrapper = mount(TestComponent, {
      props: { params }
    });

    expect(reviewsApi.getReviews).toHaveBeenCalledTimes(1);

    params.formId = '2';
    await nextTick();

    expect(reviewsApi.getReviews).toHaveBeenCalledTimes(2);

    await vi.waitFor(() => {
      if (!wrapper.vm.data) throw new Error('No data');
      expect(wrapper.vm.data.reviews[0].id).toBe('2');
    });

    resolveFirst({ data: [{ id: '1' }], meta: { page: 1, totalPages: 1 } });
    await nextTick();

    expect(wrapper.vm.data?.reviews[0].id).toBe('2');
  });
});
