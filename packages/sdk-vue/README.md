# @reviewskits/vue

The official Vue 3 SDK for **Reviewskits**.

## Installation

```bash
bun add @reviewskits/vue
```

## Setup

### 1. Initialize the Plugin

In your main entry file (e.g., `main.ts`):

```typescript
import { createApp } from 'vue'
import { createReviewsKit } from '@reviewskits/vue'
import App from './App.vue'

const app = createApp(App)

// Initialize Reviewskits
app.use(createReviewsKit({
  host: 'https://reviews.your-domain.com',
  pk: 'pk_your_public_key'
}))

app.mount('#app')
```

## Usage

### Fetching Reviews

Use the `useReviews` composable for standard pagination.

```vue
<script setup>
import { useReviews } from '@reviewskits/vue'

const { data, isLoading, error } = useReviews({
  formId: 'your_form_id', // Now required here
  limit: 10,
  minRating: 4,
  page: 1
})
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>
    <div v-for="review in data.reviews" :key="review.id">
      <h3>{{ review.author.name }}</h3>
      <p>{{ review.content }}</p>
      <span>Rating: {{ review.rating }}</span>
    </div>
  </div>
</template>
```

### Infinite Scrolling

Use `useInfiniteReviews` for "Load More" patterns.

```vue
<script setup>
import { useInfiniteReviews } from '@reviewskits/vue'

const { 
  data, 
  fetchNextPage, 
  hasNextPage, 
  isLoading 
} = useInfiniteReviews({ 
  formId: 'your_form_id',
  limit: 5 
})
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else>
    <div v-for="page in data?.pages" :key="page.meta.page">
      <div v-for="review in page.reviews" :key="review.id">
        <!-- Review content -->
      </div>
    </div>
    
    <button 
      v-if="hasNextPage" 
      @click="fetchNextPage"
    >
      Load More
    </button>
  </div>
</template>
```

### Advanced: Multi-form Support

If your application needs to display reviews from different forms, you can override the global `formId` by passing it directly to the composable.

```vue
<script setup>
import { useReviews } from '@reviewskits/vue'

// This will use the 'form-a-id' instead of the global default
const { data, isLoading } = useReviews({ 
  formId: 'form-a-id',
  limit: 5 
})
</script>
```

## License

MIT
