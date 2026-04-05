import { describe, it, expect, mock, beforeEach, type Mock } from 'bun:test';
import { useReviews } from '../useReviews';
import { reviewsApi } from '@reviewskits/core';
import { reactive, nextTick, defineComponent } from 'vue';
import { mount } from '@vue/test-utils';

import { spyOn } from 'bun:test';

spyOn(reviewsApi, 'getReviews');

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
    (reviewsApi.getReviews as Mock<any>).mockClear();
  });

  it('should cancel previous request when params change', async () => {
    let abortSignal: AbortSignal | undefined;

    (reviewsApi.getReviews as Mock<any>).mockImplementation((_params: any, options?: RequestInit) => {
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

    (reviewsApi.getReviews as Mock<any>)
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

    // wait until the data in vm is updated
    while (!wrapper.vm.data?.reviews?.[0]) {
      await new Promise(r => setTimeout(r, 10));
    }

    expect(wrapper.vm.data.reviews[0].id).toBe('2');

    resolveFirst({ data: [{ id: '1' }], meta: { page: 1, totalPages: 1 } });
    await nextTick();

    expect(wrapper.vm.data?.reviews[0].id).toBe('2');
  });
});
