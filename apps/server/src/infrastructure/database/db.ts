import { drizzle } from 'drizzle-orm/bun-sql';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl && process.env.NODE_ENV !== 'test') {
  throw new Error("DATABASE_URL environment variable is required. Please set it in your .env file.");
}

export const db = drizzle(databaseUrl || '', { schema });
