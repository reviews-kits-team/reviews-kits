# Contributing to Reviewskits

Thanks for taking the time to contribute. This guide will get you up and running quickly.

---

## Before you start

- Check [existing issues](https://github.com/reviews-kits-team/reviews-kits/issues) before opening a new one
- For big changes, open an issue first to discuss — avoid spending time on a PR that won't be merged
- Read the [Code of Conduct](./CODE_OF_CONDUCT.md)

---

## Setup

**Requirements:**
- [Bun](https://bun.sh) >= 1.0
- [Docker](https://docker.com) >= 24.0
- [Git](https://git-scm.com)
- [Make](https://www.gnu.org/software/make/) (pre-installed on macOS and Linux)

```bash
# 1. Fork the repo, then clone your fork
git clone https://github.com/reviews-kits-team/reviews-kits.git
cd reviews-kits

# 2. Install dependencies
bun install

# 3. Copy environment variables
cp .env.example .env

# 4. Start everything with a single command
make dev
```

`make dev` handles the full setup automatically: starts the Docker infrastructure (PostgreSQL, Redis, MinIO, Mailpit), waits for the database to be ready, pushes the schema, and starts the dev server in hot-reload mode.

To stop the infrastructure:
```bash
make stop
```

### Windows (without Make)

If you are on Windows and don't have `make`, run these steps manually:

```bash
# Start infrastructure
docker compose -f infra/docker-compose.dev.yml up -d

# Wait for the DB to be ready, then push the schema
cd apps/server && bun run db:push && cd ../..

# Start the dev server
bun run dev
```

---

## Code Quality & Testing

Before submitting a Pull Request, please ensure your code is clean and tested:

```bash
# Run ESLint and TypeScript checks across all workspaces
bun run lint

# Run the test suite
bun run test
```

---

## Database & Migrations

The API uses **Drizzle ORM** with PostgreSQL. The schema is defined in `apps/server/src/db/schema.ts` (or equivalent).

When you make changes to the database schema:
1. Make sure your local database is running (`docker compose -f infra/docker-compose.dev.yml up -d`).
2. Push your changes to your local DB for testing: `cd apps/server && bunx drizzle-kit push`.
3. (Optional for now) Generate a migration file if required by the core team: `cd apps/server && bunx drizzle-kit generate`.

---

## Workflow

```bash
# 1. Create a branch from main
git checkout -b feat/my-feature
# or
git checkout -b fix/my-bug

# 2. Make your changes

# 3. Commit using conventional commits (see below)
# Note: Husky will automatically run `bun run lint && bun run test` before committing.
# If these checks fail, your commit will be rejected.
git commit -m "feat: add CSV import endpoint"

# 4. Push and open a Pull Request
git push origin feat/my-feature
```

---

## Commit convention

We use [Conventional Commits](https://www.conventionalcommits.org).

| Prefix | When to use |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `chore:` | Deps, config, tooling |
| `refactor:` | Code change, no new feature or fix |
| `test:` | Adding or updating tests |
| `ci:` | CI/CD changes |

```bash
# Good
git commit -m "feat: add useSubmitReview hook to SDK"
git commit -m "fix: webhook retry not respecting backoff delay"
git commit -m "docs: add self-hosting guide to README"

# Bad
git commit -m "update stuff"
git commit -m "fix bug"
git commit -m "WIP"
```

---

## Project structure

```
reviews-kits/
├── apps/
│   ├── server/        ← Hono API + Better-Auth
│   ├── admin/         ← React + Vite admin dashboard
│   └── docs/          ← Public documentation (WIP)
├── packages/
│   ├── types/         ← shared TypeScript types (@reviewskits/types)
│   ├── sdk-react/     ← React hooks (@reviewskits/react) (WIP)
│   └── sdk-vue/       ← Vue composables (@reviewskits/vue) (post-MVP)
├── infra/             ← Docker Compose files
└── .github/           ← CI, issue templates, PR template
```

---

## Shared Types (`@reviewskits/types`)

We use a dedicated package `packages/types` to share TypeScript interfaces, types, and Zod schemas across the entire monorepo (API, Admin Dashboard, and SDKs). This is our single source of truth.

**The Golden Rule:** Never duplicate a type or schema on the client side (e.g., `apps/admin`) if an equivalent exists or should exist on the server side (`apps/server`). Always extract shared contracts to `packages/types`.

### How to use a shared type:

Import the required type directly from the package in your frontend or backend code:

```typescript
import type { User, Testimonial } from '@reviewskits/types';
// or schemas
import { userSchema } from '@reviewskits/types';
```

### How to add/modify a type:

1. Locate the file in `packages/types/src/` (or create a new domain file).
2. Export your Zod schema and its inferred TypeScript type:
   ```typescript
   export const myNewSchema = z.object({ id: z.string() });
   export type MyNewModel = z.infer<typeof myNewSchema>;
   ```
3. Make sure it is exported in `packages/types/src/index.ts`.
4. Run the build command from the root to generate the `.d.ts` declaration files:
   ```bash
   bun run build
   # or run dev in parallel
   bun run dev
   ```

---

## What you can contribute

**Good first issues** — look for issues tagged [`good first issue`](https://github.com/reviews-kits-team/reviews-kits/labels/good%20first%20issue). These are small, well-defined tasks ideal if you're new to the project.

**Bug fixes** — always welcome. Please link the issue in your PR.

**Features** — open an issue first to align before coding.

**Documentation** — typos, unclear sections, missing examples — all PRs welcome, no issue needed.

**SDK ports** — Vue, Svelte, Angular SDKs are planned. Open an issue if you want to take one.

---

## Pull Request checklist

Before submitting your PR:

- [ ] Code builds without errors (`bun run build`)
- [ ] Code passes all linting rules (`bun run lint`)
- [ ] All tests pass without errors (`bun run test`)
- [ ] No `console.log` or debug code left
- [ ] No `.env` or secrets committed
- [ ] Documentation updated if needed
- [ ] PR description is filled out

---

## Need help?

Open a [GitHub Discussion](https://github.com/reviews-kits-team/reviews-kits/discussions) — we're happy to help.