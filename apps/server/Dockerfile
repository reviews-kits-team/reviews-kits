FROM oven/bun:1-alpine AS base
WORKDIR /app

# ─── Dependencies ────────────────────────────────────────────
FROM base AS deps
COPY package.json bun.lock turbo.json ./
COPY apps/server/package.json ./apps/server/
COPY apps/admin/package.json ./apps/admin/
COPY apps/docs/package.json ./apps/docs/
COPY packages/types/package.json ./packages/types/
COPY packages/sdk-react/package.json ./packages/sdk-react/
COPY packages/sdk-vue/package.json ./packages/sdk-vue/

RUN bun install --frozen-lockfile

# ─── Build server ─────────────────────────────────────────────
FROM deps AS build-server
COPY packages/types ./packages/types
COPY apps/server ./apps/server
RUN cd apps/server && bun run build

# ─── Production image ─────────────────────────────────────────
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build-server /app/apps/server/dist ./dist
COPY --from=build-server /app/apps/server/drizzle ./drizzle
COPY --from=deps         /app/node_modules ./node_modules

EXPOSE 3000

CMD ["bun", "run", "dist/index.js"]
