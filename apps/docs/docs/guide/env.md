# Environment Variables

Configure your Reviewskits instance using environment variables. Copy `.env.example` to `.env` and fill in the required values before starting the server.

```bash
cp .env.example .env
```

---

## Development Mode

Use these configurations for your local development `.env` file:

```env
# Database Server (PostgreSQL)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=reviewskits

# Prisma / Drizzle Database URL (Localhost for local dev)
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5433/${POSTGRES_DB}

# Auth
BETTER_AUTH_SECRET=wOMDxFn6aefAaCfvVX3go2j6ZLRCCofl

# Admin Initial Credentials
ADMIN_EMAIL=admin@reviewskits.com
ADMIN_PASSWORD=admin_secure_password
BETTER_AUTH_URL=http://localhost:3000/api/auth

# Object Storage / Minio (Localhost for local dev)
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_BUCKET=reviewskits-media
```

## Production Mode

Use these secure configurations when deploying to your `.env` in production:

```env
# --- Domain & SSL ---
DOMAIN=your.domain.tld
ACME_EMAIL=example@gmail.com
NODE_ENV=production

# --- Database ---
POSTGRES_PASSWORD=generate_a_secure_password
DATABASE_URL=postgresql://postgres:generate_a_secure_password@db:5432/reviewskits

# --- Auth & Admin ---
BETTER_AUTH_SECRET=generate_a_random_32_chars_string
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=your_secure_admin_password
```
