#!/bin/sh
set -e

echo "=== ReviewsKits Server Setup ==="

echo "[1/3] Running database migrations..."
bun run dist/migrate.js

echo "[2/3] Seeding admin user..."
bun run dist/seed-admin.js

echo "[3/3] Starting server..."
exec bun run dist/index.js
