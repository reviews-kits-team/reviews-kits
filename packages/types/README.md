# @reviewskits/types

<div align="center">
  <img src="https://raw.githubusercontent.com/reviews-kits-team/reviews-kits/main/apps/docs/docs/public/logo.svg" alt="ReviewsKits Logo" width="120" />
  <h3>Shared TypeScript Definitions for ReviewsKits</h3>
  <p>The core type definitions and interfaces used across the ReviewsKits ecosystem.</p>
</div>

<p align="center">
  <a href="https://docs.reviewskits.com"><strong>Explore the docs »</strong></a>
  <br />
  <br />
  <a href="https://reviewskits.com">Website</a>
  ·
  <a href="https://docs.reviewskits.com">Documentation</a>
</p>

## 📦 About

This package contains the shared TypeScript types, interfaces, and enums used by:
- `@reviewskits/react`
- `@reviewskits/vue`
- ReviewsKits Backend API

## 🚀 Installation

This package is typically installed automatically as a dependency of the official SDKs. If you need it directly:

```bash
bun add @reviewskits/types
# or
npm install @reviewskits/types
```

## 💻 Usage

Most types are exported directly from the root:

```typescript
import type { Review, ReviewsKitConfig } from '@reviewskits/types'

const myConfig: ReviewsKitConfig = {
  pk: 'YOUR_PUBLIC_KEY',
  host: 'https://api.reviewskits.com'
}
```

## ⚖️ License

MIT © [ReviewsKits](https://reviewskits.com)
