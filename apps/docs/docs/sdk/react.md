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
Wrap your application with the `ReviewProvider` to enable Reviewskits context.

```tsx
import { ReviewProvider } from '@reviewskits/react';

function App({ children }) {
  return (
    <ReviewProvider 
      apiKey="pk_your_public_key" 
      baseUrl="https://reviews.yourdomain.com"
    >
      {children}
    </ReviewProvider>
  );
}
```

### 2. Fetch Reviews
Use the `useReviews` hook to fetch and display approved testimonials.

```tsx
import { useReviews } from '@reviewskits/react';

function Testimonials() {
  const { reviews, isLoading, error } = useReviews();

  if (isLoading) return <p>Loading testimonials...</p>;
  if (error) return <p>Error loading testimonials: {error.message}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reviews.map((review) => (
        <div key={review.id} className="p-4 border rounded shadow">
          <p className="italic text-gray-700">"{review.content}"</p>
          <p className="mt-2 font-bold">— {review.authorName}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Advanced Usage

### Pagination
The `useReviews` hook supports pagination and filtering out of the box.

```tsx
const { reviews, loadMore, hasMore } = useReviews({ 
  limit: 10,
  page: 1 
});
```

### Custom Formatting
Since Reviewskits is **headless**, you have total control over the UI. You can use any styling library (Tailwind, CSS Modules, Styled Components) to render the data.
