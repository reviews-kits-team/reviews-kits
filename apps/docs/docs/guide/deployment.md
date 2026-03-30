# Deployment

Reviewskits is fully containerized and designed to be self-hosted on any VPS or infrastructure supporting Docker.

---

## 🏗️ Production Setup

Before deploying, ensure you have a domain pointed to your server's IP address (A Record). Reviewskits uses Traefik by default to handle SSL certificates via Let's Encrypt.

### Environment Variables
You will need to configure the following variables in your `.env` file or PaaS dashboard:

| Variable | Description |
|---|---|
| `DOMAIN` | Your deployment domain (e.g., `reviews.example.com`) |
| `ACME_EMAIL` | Email for SSL certificate notifications |
| `DATABASE_URL` | `postgresql://postgres:PASSWORD@db:5432/reviewskits` |
| `POSTGRES_PASSWORD` | A secure password for the database |
| `BETTER_AUTH_SECRET` | A random 32-character string |
| `ADMIN_EMAIL` | The email you'll use to log in |
| `ADMIN_PASSWORD` | Your admin password |

---

## 🐳 Option A: Standard Docker Compose (VPS)

This is the recommended approach for most users. It includes everything: Proxy, Admin, API, and Database.

**1. Create a `.env` file**:
```env
# --- Domain & SSL ---
DOMAIN=yourdomain.com
ACME_EMAIL=your@email.com

# --- Database ---
POSTGRES_PASSWORD=generate_a_secure_password
DATABASE_URL=postgresql://postgres:generate_a_secure_password@db:5432/reviewskits

# --- Auth & Admin ---
BETTER_AUTH_SECRET=generate_a_random_32_chars_string
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=your_secure_admin_password
```

**2. Create a `docker-compose.yml`**:
```yaml
services:
  # ─── Reverse Proxy (Traefik) ──────────────────────────────
  traefik:
    image: traefik:v3.0
    restart: unless-stopped
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.letsencrypt.acme.email=${ACME_EMAIL}"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt:/letsencrypt
    networks:
      - reviewskits

  # ─── Admin (frontend React) ───────────────────────────────────
  admin:
    image: ghcr.io/reviews-kits-team/reviewskits-admin:latest
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.admin.rule=Host(`${DOMAIN}`)"
      - "traefik.http.routers.admin.entrypoints=websecure"
      - "traefik.http.routers.admin.tls.certresolver=letsencrypt"
      - "traefik.http.routers.admin.priority=1"
      - "traefik.http.services.admin.loadbalancer.server.port=80"
    networks:
      - reviewskits

  # ─── Server (API Hono) ────────────────────────────────────────
  server:
    image: ghcr.io/reviews-kits-team/reviewskits-server:latest
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
      BETTER_AUTH_URL: https://${DOMAIN}/api/auth
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      STORAGE_ENDPOINT: ${STORAGE_ENDPOINT}
      STORAGE_ACCESS_KEY: ${STORAGE_ACCESS_KEY}
      STORAGE_SECRET_KEY: ${STORAGE_SECRET_KEY}
      STORAGE_BUCKET: ${STORAGE_BUCKET}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.server.rule=Host(`${DOMAIN}`) && PathPrefix(`/api`)"
      - "traefik.http.routers.server.entrypoints=websecure"
      - "traefik.http.routers.server.tls.certresolver=letsencrypt"
      - "traefik.http.routers.server.priority=10"
      - "traefik.http.services.server.loadbalancer.server.port=3000"
    depends_on:
      db:
        condition: service_healthy
    networks:
      - reviewskits

  # ─── Database ──────────────────────────────────────────
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB:-reviewskits}
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - reviewskits

networks:
  reviewskits:
    driver: bridge

volumes:
  db-data:
  letsencrypt:
```

**3. Launch**:
```bash
docker compose up -d
```

---

## 🚀 Option B: Deploy with Coolify

[Coolify](https://coolify.io/) handles SSL and networking for you.

**1. Create a Docker Compose Resource**:
Paste this simplified configuration into Coolify:

```yaml
services:
  admin:
    image: ghcr.io/reviews-kits-team/reviewskits-admin:latest
    restart: unless-stopped
    networks:
      - reviewskits

  server:
    image: ghcr.io/reviews-kits-team/reviewskits-server:latest
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
      BETTER_AUTH_URL: https://${DOMAIN}/api/auth
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      STORAGE_ENDPOINT: ${STORAGE_ENDPOINT}
      STORAGE_ACCESS_KEY: ${STORAGE_ACCESS_KEY}
      STORAGE_SECRET_KEY: ${STORAGE_SECRET_KEY}
      STORAGE_BUCKET: ${STORAGE_BUCKET}
    depends_on:
      db:
        condition: service_healthy
    networks:
      - reviewskits

  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB:-reviewskits}
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - reviewskits

networks:
  reviewskits:
    driver: bridge

volumes:
  db-data:
```

---

## 🔐 Security Best Practices

1. **Better Auth Secret**: Generate a strong 32-character random string.
2. **Database Backups**: If using the Docker database, ensure the `db-data` volume is backed up.
3. **HTTPS**: Traefik handles this automatically in Option A. In Option B, Coolify takes care of it.
