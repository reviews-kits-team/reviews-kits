import { migrate } from 'drizzle-orm/bun-sql/migrator';
import { db } from '../src/infrastructure/database/db';
import { resolve } from 'path';

console.log('[MIGRATE] Running database migrations...');

try {
  await migrate(db, { migrationsFolder: resolve('./drizzle') });
  console.log('[MIGRATE] Migrations applied successfully.');
} catch (error) {
  console.error('[MIGRATE] Migration failed:', error);
  process.exit(1);
}

process.exit(0);
