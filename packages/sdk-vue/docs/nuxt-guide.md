# Using @reviewskits/vue with Nuxt 3

Integrating the ReviewsKit SDK into Nuxt 3 is straightforward using the built-in plugin system.

## 1. Configure Runtime Variables

In your `nuxt.config.ts`, add your public key and host to the `runtimeConfig` to keep them manageable:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      reviewsKitPk: process.env.REVIEWSKITS_PK,
      reviewsKitHost: process.env.REVIEWSKITS_HOST || 'https://api.reviewskits.com'
    }
  }
})
```

## 2. Create the Nuxt Plugin

Create a file `plugins/reviewskits.ts` to initialize the SDK globally:

```typescript
import { createReviewsKit } from '@reviewskits/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public
  
  const reviewsKit = createReviewsKit({
    pk: config.reviewsKitPk as string,
    host: config.reviewsKitHost as string
  })

  nuxtApp.vueApp.use(reviewsKit)
})
```

## 3. Use Composables in Components

Now you can use `useReviews` or `useInfiniteReviews` in any component.

```vue
<script setup lang="ts">
import { useReviews } from '@reviewskits/vue'

// All parameters are optional except formId
const { data, isLoading, error } = useReviews({
  formId: 'your_form_id',
  limit: 5,
  minRating: 4
})
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">Error loading reviews</div>
  
  <div v-else class="grid gap-4">
    <div v-for="review in data?.reviews" :key="review.id" class="p-4 border rounded">
      <div class="flex justify-between">
        <span class="font-bold">{{ review.author.name }}</span>
        <span>{{ "★".repeat(review.rating) }}</span>
      </div>
      
      <p class="text-xs text-gray-500">{{ review.author.title }}</p>
      <p class="mt-2">{{ review.content }}</p>
      
      <div class="mt-4 flex justify-between text-[10px] text-gray-400 uppercase">
        <span>{{ new Date(review.createdAt).toLocaleDateString() }}</span>
        <span>Source: {{ review.source }}</span>
      </div>
    </div>
  </div>
</template>
```

## Technical Notes

- **SSR Friendly**: The composables are designed to work with Nuxt's SSR, but fetching will only occur on the client side by default if they are used inside `onMounted` or if the SDK is strictly client-only.
- **Auto-imports**: If you want to enable auto-imports for the SDK composables, you can add them to the `imports` section of `nuxt.config.ts`.
