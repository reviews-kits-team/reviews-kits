# Environment Variables

Configure your Reviewskits instance using environment variables. Copy `.env.example` to `.env` and fill in the required values before starting the server.

```bash
cp .env.example .env
```

---

## Required Variables

These variables must be set for the application to start correctly.

### Database

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Full PostgreSQL connection string | `postgresql://postgres:password@db:5432/reviewskits` |
| `POSTGRES_USER` | PostgreSQL username | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `a_very_secure_password` |
| `POSTGRES_DB` | PostgreSQL database name | `reviewskits` |

### Authentication

| Variable | Description | Example |
|----------|-------------|---------|
| `BETTER_AUTH_SECRET` | Secret key used to sign sessions. Must be at least 32 characters. | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Full URL of the auth callback, pointing to your API server | `https://yourdomain.com/api/auth` |
| `ADMIN_EMAIL` | Email address for the initial admin account (auto-created on startup) | `admin@yourdomain.com` |
| `ADMIN_PASSWORD` | Password for the initial admin account | `a_very_secure_password` |

### CORS

| Variable | Description | Example |
|----------|-------------|---------|
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of origins allowed to call the authenticated API | `https://yourdomain.com,http://localhost:5180` |

> **Note:** The public endpoints (`/api/v1/public/*`) used by the SDKs allow **all origins** by default. `CORS_ALLOWED_ORIGINS` only restricts access to the authenticated management API.

### Deployment

| Variable | Description | Example |
|----------|-------------|---------|
| `DOMAIN` | Your server's root domain (used by Traefik for routing and SSL) | `yourdomain.com` |
| `ACME_EMAIL` | Email address for Let's Encrypt SSL certificate notifications | `admin@yourdomain.com` |

---

## Optional Variables

### Object Storage (S3 / MinIO)

Required only if you enable video testimonials or file uploads.

| Variable | Description | Example |
|----------|-------------|---------|
| `STORAGE_ENDPOINT` | S3-compatible endpoint URL | `https://minio.yourdomain.com` |
| `STORAGE_ACCESS_KEY` | S3 access key ID | `minioadmin` |
| `STORAGE_SECRET_KEY` | S3 secret access key | `minioadmin` |
| `STORAGE_BUCKET` | S3 bucket name | `reviewskits` |

---

## Generating Secrets

```bash
# Generate a secure BETTER_AUTH_SECRET (requires OpenSSL)
openssl rand -base64 32

# Or with Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Full `.env.example`

```bash
# ── Deployment ─────────────────────────────────────────────────────────────────
DOMAIN=yourdomain.com
ACME_EMAIL=admin@yourdomain.com

# ── Database ───────────────────────────────────────────────────────────────────
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_me
POSTGRES_DB=reviewskits
DATABASE_URL=postgresql://postgres:change_me@db:5432/reviewskits

# ── Authentication ─────────────────────────────────────────────────────────────
BETTER_AUTH_SECRET=change_me_to_a_random_32_char_string
BETTER_AUTH_URL=https://yourdomain.com/api/auth
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=change_me

# ── CORS ───────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# ── Object Storage (optional) ──────────────────────────────────────────────────
# STORAGE_ENDPOINT=
# STORAGE_ACCESS_KEY=
# STORAGE_SECRET_KEY=
# STORAGE_BUCKET=
```
