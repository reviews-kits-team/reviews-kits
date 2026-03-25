FROM oven/bun:1-alpine AS base
WORKDIR /app

# ─── Dependencies ────────────────────────────────────────────
FROM base AS deps
COPY package.json bun.lock turbo.json ./
COPY apps/server/package.json ./apps/server/
COPY packages/types/package.json ./packages/types/

RUN bun install --frozen-lockfile

# ─── Build types ─────────────────────────────────────────────
FROM deps AS build-types
COPY packages/types ./packages/types
RUN cd packages/types && bun run build

# ─── Build server ─────────────────────────────────────────────
FROM build-types AS build-server
COPY apps/server ./apps/server
RUN cd apps/server && bun run build

# ─── Production image ─────────────────────────────────────────
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Uniquement ce qui est nécessaire en prod
COPY --from=build-server /app/apps/server/dist ./dist
COPY --from=build-types  /app/packages/types/dist ./packages/types/dist
COPY --from=deps         /app/node_modules ./node_modules

EXPOSE 3000

CMD ["bun", "run", "dist/index.js"]