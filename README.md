# REVIEWSKITS

> The open-source, self-hosted alternative to Senja. API-first, headless, developer-owned.

Collect customer testimonials via customizable forms, moderate them from a clean dashboard, and display them anywhere using our SDK — in your own design, with zero imposed UI.

**Your data stays on your server. Always.**

---

## Why Reviewskits ?

| | Senja / Testimonial.to | Reviewskits |
|---|---|---|
| Self-hosted | ❌ | ✅ |
| Your data on your server | ❌ | ✅ |
| Headless / API-first | ❌ | ✅ |
| Custom design freedom | ❌ | ✅ |
| Open-source | ❌ | ✅ |
| GDPR-friendly by architecture | ❌ | ✅ |

---

## How it works

```
Admin creates a form        →   Shares the public link
        ↓
Client submits a review     →   Stored as "pending"
        ↓
Admin approves / rejects    →   From the dashboard
        ↓
Developer fetches reviews   →   Via SDK or REST API
        ↓
Displays in their own design  — No widget, no imposed style
```

---

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/reviews-kits-team/reviews-kits.git
cd reviews-kits

# 2. Configure environment
cp .env.example .env
# → Fill in ADMIN_EMAIL, ADMIN_PASSWORD, DATABASE_URL

# 3. Launch
# For production (single command)
docker compose -f infra/docker-compose.yml up -d

# For development (infrastructure only: DB, Redis, Minio)
docker compose -f infra/docker-compose.dev.yml up -d
bun run dev

# Dashboard → http://localhost:3000/admin
# API       → http://localhost:3000/api/v1
```

That's it. No external dependencies, no cloud account required.

> **Tip:** During local development (`bun run dev`), the Vite frontend may hide the initial API backend startup logs. To view the backend logs, simply save `apps/server/src/index.ts` to trigger a hot-reload.

---

## SDK

> **Note:** The React SDK is currently in development and will be released soon. The code below is a preview of the upcoming API.

### React / Next.js

```bash
npm install @reviews-kits/react
```

```tsx
import { useReviews } from '@reviews-kits/react'

export function Reviews() {
  const { data, isLoading } = useReviews({
    host: 'https://reviews.your-domain.com',
    token: 'pk_xxxx',
    limit: 12,
    minRating: 4,
  })

  if (isLoading) return <p>Loading...</p>

  return (
    <div>
      {data.map(t => (
        <div key={t.id}>
          <p>{t.content}</p>
          <span>{t.author.name} — {t.author.title}</span>
        </div>
      ))}
    </div>
  )
}
```

The hook handles fetching, pagination, caching, and loading states. **Zero opinion on design.**

### Submit a review

```tsx
import { useSubmitTestimonial } from '@reviews-kits/react'

const { submit, isLoading } = useSubmitTestimonial({
  host: 'https://reviews.your-domain.com',
  formSlug: 'my-product',
})

await submit({
  author_name: 'Alice',
  content: 'This tool saved us hours every week.',
  rating: 5,
})
```

---

## API Reference

### Public endpoints (read)

Authentication via public key `pk_xxx` as query param or `Authorization` header.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/testimonials` | Paginated list of approved reviews |
| `GET` | `/api/v1/testimonials/:id` | Single review detail |
| `GET` | `/api/v1/testimonials/stats` | Average rating, total count, distribution |
| `POST` | `/api/v1/forms/:slug/submit` | Submit a review via form |

### Admin endpoints (write)

Authentication via secret key `sk_xxx`. **Never expose server-side keys to the client.**

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/admin/testimonials` | List all reviews (including pending) |
| `PATCH` | `/api/v1/admin/testimonials/:id` | Approve or reject a review |
| `DELETE` | `/api/v1/admin/testimonials/:id` | Delete a review |
| `GET` | `/api/v1/admin/forms` | List all forms |
| `POST` | `/api/v1/admin/forms` | Create a new form |
| `PATCH` | `/api/v1/admin/forms/:id` | Update a form |
| `DELETE` | `/api/v1/admin/forms/:id` | Delete a form |

Full OpenAPI documentation available at `/api/docs` once deployed.

---

## Stack

| Layer | Technology |
|---|---|
| Backend API | Hono + Bun |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Better-Auth |
| Dashboard | React + Shadcn UI |
| SDK | React hooks + TypeScript |
| Media storage | S3-compatible (Minio for self-host) |
| Deployment | Docker Compose |

---

## Project structure

```
reviews-kits/
├── apps/
│   ├── server/        ← API + Dashboard (Hono)
│   ├── admin/         ← Admin dashboard (React + Vite)
│   └── docs/          ← Public documentation
├── packages/
│   ├── types/         ← @reviewskits/types — shared TypeScript types
│   ├── sdk-react/     ← @reviewskits/react — React hooks (WIP)
│   └── sdk-vue/       ← @reviewskits/vue — Vue composables (post-MVP)
├── infra/
│   ├── docker-compose.yml
│   └── docker-compose.dev.yml
└── turbo.json
```

---

## Roadmap

**v0.1.0 — MVP (current)**
- [x] Public form with customizable slug
- [x] Admin dashboard — approve, reject, manage
- [x] REST API with public and admin keys
- [x] Docker Compose one-command deploy
- [ ] React SDK — `useTestimonials`, `useSubmitTestimonial`
- [ ] CSV import (migrate from Senja / Testimonial.to)

**v0.2.0**
- [ ] Vue.js SDK
- [ ] Webhooks
- [ ] Advanced analytics

**v1.0.0**
- [ ] Video testimonials
- [ ] AI-assisted moderation
- [ ] Zapier / Slack integrations

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

For bugs and feature requests, open an [issue](https://github.com/reviews-kits-team/reviews-kits.git/issues).

---

## License

[MIT](./LICENSE) — free to use, modify, and distribute.

Enterprise features (white-label, SSO, advanced analytics) are available under a separate commercial license. See [COMMERCIAL_LICENSE.md](./COMMERCIAL_LICENSE.md).