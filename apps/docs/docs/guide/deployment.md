# Deployment

Reviewskits is designed to be self-hosted on any VPS or infrastructure supporting Docker.

## Production Configuration

Before deploying, ensure your `.env` is correctly configured for your production domain.

```bash
# Your API public URL
PUBLIC_URL=https://api.reviewskits.com

# Auth base URL (must match your API domain)
BETTER_AUTH_URL=https://api.reviewskits.com/api/auth

# Allowed domains for CORS
ALLOWED_ORIGINS=https://yoursite.com,https://app.yoursite.com
```

## Docker Deployment

You can use the provided production Docker Compose file:

```bash
docker compose -f infra/docker-compose.yml up -d
```

Once the database container is running, remember to initialize the database schema:

```bash
cd apps/server && bunx drizzle-kit push && cd ../..
```

## Security Best Practices

1. **Better Auth Secret**: Generate a strong random string for `BETTER_AUTH_SECRET`.
2. **Database**: Use a managed PostgreSQL instance or ensure your Docker volume is backed up.
3. **HTTPS**: Always use a reverse proxy (Nginx, Traefik, Caddy) to handle SSL/TLS termination.
4. **API Keys**: Use Public Keys (`pk_`) for your frontend and keep Secret Keys (`sk_`) strictly server-side.
