# React SDK

Integrate Reviewskits into your React or Next.js application with our official, zero-dependency SDK.

---

## Installation

```bash
# bun
bun add @reviewskits/react
# npm
npm install @reviewskits/react
```

---

## Quick Start

### 1. Setup the Provider
Wrap your application with `ReviewsKitProvider` to configure the SDK globally. It requires a `config` object with your `host` (the URL of your Reviewskits instance) and your `pk` (public API key).

```tsx
import { ReviewsKitProvider } from '@reviewskits/react';

function App({ children }) {
  return (
    <ReviewsKitProvider
      config={{
        pk: 'pk_your_public_key',
        host: 'https://reviews.yourdomain.com',
      }}
    >
      {children}
    </ReviewsKitProvider>
  );
}
```

### 2. Fetch Reviews
Use the `useReviews` hook to fetch and display approved testimonials. The `formId` parameter is **required** — it corresponds to the `publicId` of your collection form.

```tsx
import { useReviews } from '@reviewskits/react';

function Testimonials() {
  const { data, isLoading, error } = useReviews({ formId: 'your_form_public_id' });

  if (isLoading) return <p>Loading testimonials...</p>;
  if (error) return <p>Error loading testimonials: {error.message}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data?.reviews.map((review) => (
        <div key={review.id} className="p-4 border rounded shadow">
          <p className="italic text-gray-700">"{review.content}"</p>
          <p className="mt-2 font-bold">— {review.author.name}</p>
          {review.author.title && (
            <p className="text-sm text-gray-500">{review.author.title}</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## API Reference

### `ReviewsKitProvider`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `ReviewsKitConfig` | Yes | Global SDK configuration |
| `config.pk` | `string` | Yes | Your public API key (`pk_...`) |
| `config.host` | `string` | Yes | Base URL of your Reviewskits instance |
| `children` | `ReactNode` | Yes | Your application tree |

---

### `useReviews(params)`

Fetches a single page of approved reviews. Supports AbortController for cleanup on unmount.

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
| `data` | `{ reviews: Review[] } \| null` | The fetched data, or `null` while loading |
| `isLoading` | `boolean` | `true` during the initial fetch |
| `error` | `any` | Error object if the request failed |
| `refetch` | `() => void` | Manually trigger a refetch |

**Example**

```tsx
const { data, isLoading, error, refetch } = useReviews({
  formId: 'your_form_public_id',
  limit: 6,
  minRating: 4,
});
```

---

### `useInfiniteReviews(params)`

Fetches reviews with infinite scroll / "load more" support. Use this instead of `useReviews` when you want to append pages progressively.

**Parameters**

Same as `useReviews`, **except `page`** (managed internally).

**Returns**

| Property | Type | Description |
|----------|------|-------------|
| `data` | `{ pages: { reviews: Review[], meta: ReviewApiResponseMeta }[] }` | All fetched pages |
| `isLoading` | `boolean` | `true` during the initial fetch |
| `isFetchingNextPage` | `boolean` | `true` while loading an additional page |
| `hasNextPage` | `boolean` | `true` if more pages are available |
| `error` | `any` | Error object if the request failed |
| `fetchNextPage` | `() => void` | Load the next page |
| `refetch` | `() => void` | Reset and reload from page 1 |

**Example**

```tsx
import { useInfiniteReviews } from '@reviewskits/react';

function TestimonialsWithLoadMore() {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteReviews({
    formId: 'your_form_public_id',
    limit: 9,
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {data.pages.map((page, i) =>
          page.reviews.map((review) => (
            <div key={review.id} className="p-4 border rounded">
              <p>"{review.content}"</p>
              <p>— {review.author.name}</p>
            </div>
          ))
        )}
      </div>

      {hasNextPage && (
        <button onClick={fetchNextPage} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  );
}
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

Since Reviewskits is **headless**, you have total control over the UI. You can use any styling library (Tailwind, CSS Modules, Styled Components) to render the data.
