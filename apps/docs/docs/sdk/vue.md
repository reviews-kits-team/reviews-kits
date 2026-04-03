# Vue SDK

[![NPM Package](https://img.shields.io/npm/v/@reviewskits/vue.svg)](https://www.npmjs.com/package/@reviewskits/vue)

Integrate Reviewskits into your Vue 3 or Nuxt 3 application with our official, zero-dependency SDK.

---

## Installation

```bash
# bun
bun add @reviewskits/vue
# npm
npm install @reviewskits/vue
```

---

## Quick Start (Vue 3)

### 1. Register the Plugin
In your `main.ts` or `main.js`, add the Reviewskits plugin. It requires a `pk` (public API key) and a `host` (the URL of your Reviewskits instance).

```typescript
import { createApp } from 'vue';
import { createReviewsKit } from '@reviewskits/vue';
import App from './App.vue';

const app = createApp(App);

app.use(createReviewsKit({
  pk: 'pk_your_public_key',
  host: 'https://reviews.yourdomain.com'
}));

app.mount('#app');
```

> [!TIP]
> **Locating your Credentials**
> 
> You will need your Public API Key to initialize the SDK. You can find this key by navigating to the **API Keys** section in your dashboard settings.
> 
> ![Where to find your API Key](/images/where_to_find_your_api_key.png)
> 
> When fetching reviews or submitting data for a specific form, you'll also need the Form Slug (or Form Key). This can be found directly on the form's management page.
> 
> ![Where to find your Form Slug](/images/where_to_find_your_form_key.png)

### 2. Use the Composable
In your components, use `useReviews` to fetch data. The `formId` parameter is **required** — it corresponds to the `publicId` of your collection form.

```vue
<script setup>
import { useReviews } from '@reviewskits/vue';

const { data, isLoading, error } = useReviews({ formId: 'your_form_public_id' });
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <p v-else-if="error">Error: {{ error.message }}</p>
  <div v-else class="testimonials-grid">
    <div v-for="review in data?.reviews" :key="review.id" class="card">
      <p>"{{ review.content }}"</p>
      <span>— {{ review.author.name }}</span>
      <span v-if="review.author.title">{{ review.author.title }}</span>
    </div>
  </div>
</template>
```

---

## Infinite Loading

For infinite scrolling testimonials, use the `useInfiniteReviews` composable.

```vue
<script setup>
import { useInfiniteReviews } from '@reviewskits/vue';

const { 
  data, 
  isLoading, 
  fetchNextPage, 
  hasNextPage, 
  isFetchingNextPage 
} = useInfiniteReviews({
  limit: 10
});
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else>
    <div v-for="page in data.pages" :key="page.meta.page">
      <div v-for="review in page.reviews" :key="review.id" class="card">
         <p>"{{ review.content }}"</p>
         <span>— {{ review.author.name }}</span>
      </div>
    </div>
    
    <button 
      v-if="hasNextPage" 
      @click="fetchNextPage" 
      :disabled="isFetchingNextPage"
    >
      {{ isFetchingNextPage ? 'Loading more...' : 'Load More' }}
    </button>
  </div>
</template>
```

---

## Nuxt 3 Integration

Create a plugin in `plugins/reviewskits.client.ts`:

```typescript
import { createReviewsKit } from '@reviewskits/vue';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  nuxtApp.vueApp.use(createReviewsKit({
    pk: config.public.REVIEWSKITS_API_KEY,
    host: config.public.REVIEWSKITS_BASE_URL,
  }));
});
```

Then in `nuxt.config.ts`, expose the variables:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      REVIEWSKITS_API_KEY: '',    // overridden by NUXT_PUBLIC_REVIEWSKITS_API_KEY env var
      REVIEWSKITS_BASE_URL: '',   // overridden by NUXT_PUBLIC_REVIEWSKITS_BASE_URL env var
    },
  },
});
```

---

## API Reference

### `createReviewsKit(config)`

The Vue plugin factory. Pass it to `app.use()`.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `config.pk` | `string` | Yes | Your public API key (`pk_...`) |
| `config.host` | `string` | Yes | Base URL of your Reviewskits instance |

---

### `useReviews(params)`

Fetches a single page of approved reviews. Automatically re-fetches when `params` change (deep watch).

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `formId` | `string` | Yes | The `publicId` of your collection form |
| `page` | `number` | No | Page number (default: `1`) |
| `limit` | `number` | No | Number of reviews per page (default: `10`) |
| `minRating` | `number` | No | Minimum rating filter (1–5) |

**Returns**

| Property | Type | Description |
|----------|------|-------------|
| `data` | `Ref<{ reviews: Review[] } \| null>` | The fetched data, or `null` while loading |
| `isLoading` | `Ref<boolean>` | `true` during the initial fetch |
| `error` | `Ref<any>` | Error object if the request failed |
| `refetch` | `() => void` | Manually trigger a refetch |

---

### `useInfiniteReviews(params)`

Fetches reviews with infinite scroll / "load more" support. Use this instead of `useReviews` when you want to append pages progressively.

**Parameters**

Same as `useReviews`, **except `page`** (managed internally).

**Returns**

| Property | Type | Description |
|----------|------|-------------|
| `data` | `Ref<{ pages: { reviews: Review[], meta: ReviewApiResponseMeta }[] }>` | All fetched pages |
| `isLoading` | `Ref<boolean>` | `true` during the initial fetch |
| `isFetchingNextPage` | `Ref<boolean>` | `true` while loading an additional page |
| `hasNextPage` | `Ref<boolean>` | `true` if more pages are available |
| `error` | `Ref<any>` | Error object if the request failed |
| `fetchNextPage` | `() => Promise<void>` | Load the next page |
| `refetch` | `() => void` | Reset and reload from page 1 |

**Example**

```vue
<script setup>
import { useInfiniteReviews } from '@reviewskits/vue';

const {
  data,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
} = useInfiniteReviews({
  formId: 'your_form_public_id',
  limit: 9,
});
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else>
    <div class="grid grid-cols-3 gap-4">
      <template v-for="page in data.pages" :key="page.meta.page">
        <div v-for="review in page.reviews" :key="review.id" class="card">
          <p>"{{ review.content }}"</p>
          <span>— {{ review.author.name }}</span>
        </div>
      </template>
    </div>

    <button
      v-if="hasNextPage"
      :disabled="isFetchingNextPage"
      @click="fetchNextPage"
    >
      {{ isFetchingNextPage ? 'Loading...' : 'Load more' }}
    </button>
  </div>
</template>
```

---

## The `Review` Object

After fetching, each item in `data.reviews` is a fully-mapped `Review` object:

```typescript
interface Review {
  id: string;
  content: string;
  rating: number;
  author: {
    name: string;
    email?: string;
    title?: string;
    url?: string;
  };
  createdAt: string;  // ISO 8601
  source: string;
  metadata?: Record<string, unknown>;
}
```

---

## Custom Formatting

Since Reviewskits is **headless**, you have total control over the UI. You can use any styling library (Tailwind, CSS Modules, UnoCSS) to render the data.
