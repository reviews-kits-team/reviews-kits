# React / Next.js SDK

The React SDK is optimized for modern web applications and fully compatible with Next.js App Router.

## Installation

::: code-group
```bash [bun]
bun add @reviewskits/react
```

```bash [npm]
npm install @reviewskits/react
```

```bash [pnpm]
pnpm add @reviewskits/react
```
:::

## Setup

### Basic React

```tsx
import { ReviewsKitProvider } from '@reviewskits/react'

export function Layout({ children }) {
  return (
    <ReviewsKitProvider pk="your_pk" host="your_host">
      {children}
    </ReviewsKitProvider>
  )
}
```

### Next.js (App Router)

Since `ReviewsKitProvider` uses React Context, it must be used in a **Client Component**.

1. Create a wrapper:
```tsx
'use client'
import { ReviewsKitProvider } from '@reviewskits/react'

export function ReviewsKitWrapper({ children }) {
  return <ReviewsKitProvider pk="..." host="...">{children}</ReviewsKitProvider>
}
```

2. Wrap your `app/layout.tsx`:
```tsx
export default function Layout({ children }) {
  return (
    <html>
      <body>
        <ReviewsKitWrapper>{children}</ReviewsKitWrapper>
      </body>
    </html>
  )
}
```

## Hooks

### `useReviews`

```tsx
const { data, isLoading, error } = useReviews({ 
  formId: 'your_form_id',
  limit: 10 
})
```

### `useInfiniteReviews`

```tsx
const { data, fetchNextPage, hasNextPage } = useInfiniteReviews({ 
  formId: 'your_form_id' 
})
```
