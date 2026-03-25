# @reviewskits/react

React SDK for Reviewskits. Zero-dependency, lightweight, and type-safe.

## Installation

```bash
bun add @reviewskits/react
# or
npm install @reviewskits/react
# or
pnpm add @reviewskits/react
```

## Setup

Wrap your application with the `ReviewsKitProvider`:

```tsx
import { ReviewsKitProvider } from '@reviewskits/react'

function App() {
  const config = {
    pk: 'YOUR_PUBLIC_KEY',
    host: 'https://api.reviewskits.com'
  }

  return (
    <ReviewsKitProvider config={config}>
      <MyComponent />
    </ReviewsKitProvider>
  )
}
```

## Usage

### Simple Reviews

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
        <li key={review.id}>{review.content}</li>
      ))}
    </ul>
  )
}
```

### Infinite Scrolling

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

  // data.pages contains the list of pages
}
```
