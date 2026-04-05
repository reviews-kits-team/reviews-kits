# ─── Build ────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Copier les package.json du workspace
COPY package.json bun.lock turbo.json ./
COPY apps/server/package.json ./apps/server/
COPY apps/admin/package.json ./apps/admin/
COPY apps/docs/package.json ./apps/docs/
COPY packages/types/package.json ./packages/types/
COPY packages/sdk-react/package.json ./packages/sdk-react/
COPY packages/sdk-react/playground/package.json ./packages/sdk-react/playground/
COPY packages/sdk-vue/package.json ./packages/sdk-vue/
COPY packages/sdk-vue/playground/package.json ./packages/sdk-vue/playground/
COPY packages/sdk-core/package.json ./packages/sdk-core/

RUN bun install --frozen-lockfile

# Copier les sources
COPY packages/types ./packages/types
COPY apps/admin ./apps/admin

# Builder les types puis le dashboard
RUN cd packages/types && bun run build
RUN cd apps/admin && bun run build

# ─── Production ───────────────────────────────────────────────
FROM nginx:alpine AS runner

# Copier les fichiers buildés dans Nginx
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html

# Config Nginx pour React Router (SPA)
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]