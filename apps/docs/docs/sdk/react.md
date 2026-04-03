# React SDK

[![NPM Package](https://img.shields.io/npm/v/@reviewskits/react.svg)](https://www.npmjs.com/package/@reviewskits/react)

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
Wrap your application with the `ReviewsKitProvider` to enable Reviewskits context.

```tsx
import { ReviewsKitProvider } from '@reviewskits/react';

function App({ children }) {
  return (
    <ReviewsKitProvider 
      config={{
        pk: 'pk_your_public_key',
        host: 'https://reviews.yourdomain.com'
      }}
    >
      {children}
    </ReviewsKitProvider>
  );
}
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

### 2. Fetch Reviews
Use the `useReviews` hook to fetch and display approved testimonials.

```tsx
import { useReviews } from '@reviewskits/react';

function Testimonials() {
  const { data, isLoading, error } = useReviews({
    limit: 10
  });

  if (isLoading) return <p>Loading testimonials...</p>;
  if (error) return <p>Error loading testimonials: {error.message}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data?.reviews.map((review) => (
        <div key={review.id} className="p-4 border rounded shadow">
          <p className="italic text-gray-700">"{review.content}"</p>
          <p className="mt-2 font-bold">— {review.author.name}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Infinite Loading

For infinite scrolling testimonials, use the `useInfiniteReviews` hook.

```tsx
import { useInfiniteReviews } from '@reviewskits/react';

function InfiniteTestimonials() {
  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteReviews({
    limit: 10
  });

  if (isLoading && !data) return <p>Loading...</p>;

  return (
    <div>
      <div className="grid gap-4">
        {data?.pages.map((page) => (
          <React.Fragment key={page.meta.page}>
            {page.reviews.map((review) => (
              <div key={review.id} className="p-4 border rounded">
                <p>"{review.content}"</p>
                <span>— {review.author.name}</span>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
      
      {hasNextPage && (
        <button 
          onClick={() => fetchNextPage()} 
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

---

## Advanced Usage

### Custom Formatting
Since Reviewskits is **headless**, you have total control over the UI. You can use any styling library (Tailwind, CSS Modules, Styled Components) to render the data.
