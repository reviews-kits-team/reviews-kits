# @reviewskits/react

<div align="center">
  <img src="https://raw.githubusercontent.com/reviews-kits-team/reviews-kits/main/apps/docs/docs/public/logo.svg" alt="ReviewsKits Logo" width="120" />
  <h3>The official React SDK for ReviewsKits</h3>
  <p>Zero-dependency, lightweight, and type-safe integration for testimonials and reviews.</p>
</div>

<p align="center">
  <a href="https://docs.reviewskits.com/sdk/react"><strong>Explore the docs »</strong></a>
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
  - [Simple Reviews](#simple-reviews)
  - [Infinite Scrolling](#infinite-scrolling)
- [Full Documentation](https://docs.reviewskits.com/sdk/react)

## ✨ Features

- **Zero Dependency**: Extremely lightweight footprint.
- **Type-safe**: Built with TypeScript for a better developer experience.
- **Flexible**: Easy to customize and integrate into any React workflow.
- **Hooks API**: Modern React Hooks for data fetching and state management.

## 🚀 Installation

Install the package using your preferred package manager:

```bash
bun add @reviewskits/react
# or
npm install @reviewskits/react
# or
pnpm add @reviewskits/react
```

## 🛠️ Setup

Wrap your application with the `ReviewsKitProvider` to provide the configuration globally:

```tsx
import { ReviewsKitProvider } from '@reviewskits/react'

function App() {
  const config = {
    pk: 'YOUR_PUBLIC_KEY',
    host: 'https://api.reviewskits.com',
    cache: true // Enabled by default
  }

  return (
    <ReviewsKitProvider config={config}>
      <MyComponent />
    </ReviewsKitProvider>
  )
}
```

## 💻 Usage

### Simple Reviews

Fetch and display reviews with the `useReviews` hook:

```tsx
import { useReviews } from '@reviewskits/react'

function MyComponent() {
  const { data, isLoading, error } = useReviews({ 
    formId: 'YOUR_FORM_ID' 
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {data?.reviews.map(review => (
        <li key={review.id}>
          <strong>{review.author.name}</strong>: {review.content}
        </li>
      ))}
    </ul>
  )
}
```

### Infinite Scrolling

For large lists, use `useInfiniteReviews` to implement "load more" patterns:

```tsx
import { useInfiniteReviews } from '@reviewskits/react'

function MyComponent() {
  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteReviews({ 
    formId: 'YOUR_FORM_ID' 
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {data?.pages.map((page, i) => (
        <React.Fragment key={i}>
          {page.reviews.map(review => (
            <div key={review.id}>{review.content}</div>
          ))}
        </React.Fragment>
      ))}
      
      {hasNextPage && (
        <button 
          onClick={() => fetchNextPage()} 
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </button>
      )}
    </div>
  )
}
```

## 💡 Best Practices

### Handling Async States
Our hooks internally use `AbortController` to cancel stale requests when parameters change. This ensures that you always see the data corresponding to your latest filters.

### Dependency Management
If you are using our hooks inside your own `useEffect` or `useCallback`, make sure to include the hook's returned values (like `data` or `refetch`) in your dependency arrays to avoid stale closures.

```tsx
const { data, refetch } = useReviews({ formId });

useEffect(() => {
  // Always use the latest data
  console.log('Latest reviews:', data?.reviews);
}, [data]);
```

## 📄 Documentation

For detailed API reference and advanced guides, please visit our [Full Documentation](https://docs.reviewskits.com/sdk/react).

## ⚖️ License

MIT © [ReviewsKits](https://reviewskits.com)
