# Using @reviewskits/react with Next.js

Since `@reviewskits/react` relies on React Context and Hooks, it must be used within **Client Components** when using Next.js (App Router).

## 1. Create a Client Provider

In the Next.js App Router, the `layout.tsx` is a Server Component by default. You should create a separate client-side wrapper for the SDK provider.

Create a file `components/ReviewsKitProviderWrapper.tsx`:

```tsx
'use client';

import { ReviewsKitProvider } from '@reviewskits/react';
import { ReactNode } from 'react';

export function ReviewsKitProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <ReviewsKitProvider config={{
      pk: process.env.NEXT_PUBLIC_REVIEWSKITS_PK!,
      host: process.env.NEXT_PUBLIC_REVIEWSKITS_HOST || 'https://api.reviewskits.com'
    }}>
      {children}
    </ReviewsKitProvider>
  );
}
```

### Why a Client Wrapper?

Next.js App Router uses **Server Components** by default for layouts and pages. However, React Context (used by `ReviewsKitProvider`) is a client-side feature. 

By creating a separate `ReviewsKitProviderWrapper` with the `'use client'` directive, you create a "Client Boundary". This allowed you to keep your `layout.tsx` as a Server Component (good for SEO) while still providing the SDK context to all its children.

## 2. Wrap your Layout

In your `app/layout.tsx`, wrap the `children` with your new provider wrapper:

```tsx
import { ReviewsKitProviderWrapper } from '@/components/ReviewsKitProviderWrapper';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ReviewsKitProviderWrapper>
          {children}
        </ReviewsKitProviderWrapper>
      </body>
    </html>
  );
}
```

## 3. Use Hooks in Client Components

Any component using `useReviews` or `useInfiniteReviews` must have the `'use client'` directive at the top.

```tsx
'use client';

import { useReviews } from '@reviewskits/react';

export default function Testimonials() {
  // You can pass 4+ parameters to customize the results
  const { data, isLoading, error } = useReviews({ 
    formId: 'your_form_id',
    limit: 10,           // 1. Limit the number of reviews
    minRating: 4,        // 2. Only show 4+ stars reviews
    page: 1              // 3. Pagination support
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading reviews</div>;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {data?.reviews.map(review => (
        <div key={review.id} className="p-6 border rounded-xl shadow-sm bg-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg">{review.author.name}</h3>
            {/* 4. Displaying the rating visually */}
            <div className="text-yellow-400">
              {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
            </div>
          </div>
          
          {/* 5. Author Title/Company */}
          {review.author.title && (
            <p className="text-sm text-gray-500 mb-4">{review.author.title}</p>
          )}

          {/* 6. The content itself */}
          <p className="text-gray-700 italic">"{review.content}"</p>

          <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
            {/* 7. Creation Date */}
            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
            
            {/* 8. Source Label */}
            <span className="uppercase tracking-widest">{review.source}</span>
          </div>

          {/* 9. Link to profile or source */}
          {review.author.url && (
            <a 
              href={review.author.url} 
              target="_blank" 
              className="mt-4 inline-block text-sm text-blue-600 hover:underline"
            >
              View original review →
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
```

## Troubleshooting

### "ReviewsKit SDK not initialized properly"
This usually happens if:
1. You forgot to wrap your app with `ReviewsKitProvider`.
2. You are trying to use the hook in a Server Component (where context is not available). Make sure to add `'use client'` at the top of your component file.
