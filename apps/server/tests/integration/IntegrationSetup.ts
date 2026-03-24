import { drizzle } from 'drizzle-orm/bun-sql';
import * as schema from '../../src/infrastructure/database/schema';
import { sql } from 'drizzle-orm';

// Build DATABASE_URL from environment variables
const POSTGRES_USER = process.env.POSTGRES_USER || 'postgres';
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'your_secure_password';
const POSTGRES_DB = process.env.POSTGRES_DB || 'reviewskits';
const url = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5433/${POSTGRES_DB}`;

// In Bun.sql, we pass the URL directly to drizzle
export const testDb = drizzle(url, { schema });

/**
 * Utility to clear all tables in the database to ensure test isolation.
 * Uses CASCADE to handle foreign key constraints.
 */
export async function clearDatabase() {
  const tables = [
    'webhook_logs',
    'webhooks',
    'testimonials',
    'media',
    'forms',
    'api_keys',
    'sessions',
    'accounts',
    'verifications',
    'users',
    'rate_limits'
  ];

  for (const table of tables) {
    await testDb.execute(sql.raw(`TRUNCATE TABLE "${table}" CASCADE`));
  }
}

export async function closeConnection() {
  // Bun.sql handles connection pooling automatically
}
