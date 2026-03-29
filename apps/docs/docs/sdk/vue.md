# Vue SDK

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
import { createReviewskits } from '@reviewskits/vue';
import App from './App.vue';

const app = createApp(App);

app.use(createReviewskits({
  apiKey: 'pk_your_public_key',
  baseUrl: 'https://reviews.yourdomain.com'
}));

app.mount('#app');
```

### 2. Use the Composable
In your components, use `useReviews` to fetch data.

```vue
<script setup>
import { useReviews } from '@reviewskits/vue';

const { reviews, isLoading } = useReviews();
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else class="testimonials-grid">
    <div v-for="review in reviews" :key="review.id" class="card">
      <p>"{{ review.content }}"</p>
      <span>— {{ review.authorName }}</span>
    </div>
  </div>
</template>
```

---

## Nuxt 3 Integration

Create a plugin in `plugins/reviewskits.client.ts`:

```typescript
import { createReviewskits } from '@reviewskits/vue';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  
  nuxtApp.vueApp.use(createReviewskits({
    apiKey: config.public.REVIEWSKITS_API_KEY,
    baseUrl: config.public.REVIEWSKITS_BASE_URL
  }));
});
```
