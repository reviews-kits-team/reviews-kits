# @reviewskits/vue

<div align="center">
  <img src="https://raw.githubusercontent.com/reviews-kits-team/reviews-kits/main/apps/docs/docs/public/logo.svg" alt="ReviewsKits Logo" width="120" />
  <h3>The official Vue 3 SDK for ReviewsKits</h3>
  <p>Lightweight, type-safe integration for testimonials and reviews in Vue 3 and Nuxt applications.</p>
</div>

<p align="center">
  <a href="https://docs.reviewskits.com/sdk/vue"><strong>Explore the docs »</strong></a>
  <br />
  <br />
  <a href="https://reviewskits.com">Website</a>
  ·
  <a href="https://docs.reviewskits.com">Documentation</a>
</p>

## 📖 Quick Links

- [Installation](#-installation)
- [Setup](#-setup)
- [Usage](#-usage)
  - [Fetching Reviews](#fetching-reviews)
  - [Infinite Scrolling](#infinite-scrolling)
- [Nuxt Support](#nuxt-support)
- [Full Documentation](https://docs.reviewskits.com/sdk/vue)

## ✨ Features

- **Vue 3 Optimized**: Built with the Composition API in mind.
- **Nuxt Friendly**: Ready-to-use plugin for Nuxt 3 projects.
- **Type-safe**: Built with TypeScript for a better developer experience.
- **Composable API**: Simple and powerful composables for data fetching.

## 🚀 Installation

Install the package using your preferred package manager:

```bash
bun add @reviewskits/vue
# or
npm install @reviewskits/vue
# or
pnpm add @reviewskits/vue
```

## 🛠️ Setup

### 1. Initialize the Plugin

In your main entry file (e.g., `main.ts`):

```typescript
import { createApp } from 'vue'
import { createReviewsKit } from '@reviewskits/vue'
import App from './App.vue'

const app = createApp(App)

// Initialize Reviewskits
app.use(createReviewsKit({
  pk: 'pk_your_public_key',
  host: 'https://api.reviewskits.com'
}))

app.mount('#app')
```

### 2. Nuxt 3 Support

For Nuxt 3, create a plugin in `plugins/reviewskits.ts`:

```typescript
import { createReviewsKit } from '@reviewskits/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  
  nuxtApp.vueApp.use(createReviewsKit({
    pk: config.public.reviewsKitPk,
    host: 'https://api.reviewskits.com'
  }))
})
```

## 💻 Usage

### Fetching Reviews

Use the `useReviews` composable for standard pagination:

```vue
<script setup>
import { useReviews } from '@reviewskits/vue'

const { data, isLoading, error } = useReviews({
  formId: 'your_form_id',
  limit: 10
})
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>
    <div v-for="review in data.reviews" :key="review.id">
      <h3>{{ review.author.name }}</h3>
      <p>{{ review.content }}</p>
      <span>Rating: {{ review.rating }}/5</span>
    </div>
  </div>
</template>
```

### Infinite Scrolling

Use `useInfiniteReviews` for "Load More" patterns:

```vue
<script setup>
import { useInfiniteReviews } from '@reviewskits/vue'

const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteReviews({ 
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
    
    <button v-if="hasNextPage" @click="fetchNextPage">Load More</button>
  </div>
</template>
```

## 📄 Documentation

For detailed API reference and advanced guides, please visit our [Full Documentation](https://docs.reviewskits.com/sdk/vue).

## ⚖️ License

MIT © [ReviewsKits](https://reviewskits.com)
