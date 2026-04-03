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
In your `main.ts` or `main.js`, add the Reviewskits plugin.

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
In your components, use `useReviews` to fetch data.

```vue
<script setup>
import { useReviews } from '@reviewskits/vue';

const { data, isLoading } = useReviews({
  limit: 10
});
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else class="testimonials-grid">
    <div v-for="review in data?.reviews" :key="review.id" class="card">
      <p>"{{ review.content }}"</p>
      <span>— {{ review.author.name }}</span>
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
    pk: config.public.REVIEWSKITS_PK,
    host: config.public.REVIEWSKITS_HOST
  }));
});
```
