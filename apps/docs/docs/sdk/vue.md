# Vue.js / Nuxt 3 SDK

The official Vue 3 SDK for Reviewskits is a lightweight, zero-dependency package designed for performance.

## Installation

::: code-group
```bash [bun]
bun add @reviewskits/vue
```

```bash [npm]
npm install @reviewskits/vue
```

```bash [pnpm]
pnpm add @reviewskits/vue
```
:::

## Setup

### Vue 3 (Vite)

```typescript
import { createApp } from 'vue'
import { createReviewsKit } from '@reviewskits/vue'

const app = createApp(App)

app.use(createReviewsKit({
  pk: 'your_public_key',
  host: 'https://api.reviewskits.com'
}))
```

### Nuxt 3 (Plugin)

Create a file `plugins/reviewskits.ts`:

```typescript
import { createReviewsKit } from '@reviewskits/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const reviewsKit = createReviewsKit({
    pk: useRuntimeConfig().public.reviewsKitPk,
    host: useRuntimeConfig().public.reviewsKitHost
  })
  nuxtApp.vueApp.use(reviewsKit)
})
```

## Usage

### `useReviews`

Basic fetching with manual pagination.

```vue
<script setup>
const { data, isLoading } = useReviews({ 
  formId: 'your_form_id',
  limit: 10,
  page: 1
})
</script>
```

### `useInfiniteReviews`

Infinite scrolling pattern.

```vue
<script setup>
const { data, fetchNextPage, hasNextPage } = useInfiniteReviews({ 
  formId: 'your_form_id',
  limit: 5 
})
</script>
```

## Available Attributes

Each review object contains:
- `id`: Unique identifier
- `content`: Testimonial text
- `rating`: 1 to 5
- `createdAt`: ISO date
- `source`: Origin (google, direct, etc.)
- `author`: { name, email, title, url }
