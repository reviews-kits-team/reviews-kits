import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { sql } from "drizzle-orm";
import { db } from "../database/db";
import * as schema from "../database/schema";

const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) {
  throw new Error("BETTER_AUTH_SECRET environment variable is required for session encryption. Please set it in your .env file.");
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    bearer(),
  ],
  user: {
    additionalFields: {
      isSystemAdmin: {
        type: "boolean",
        defaultValue: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Strictly allow only defined schema fields
          const allowedFields = ['id', 'name', 'email', 'emailVerified', 'image', 'isSystemAdmin', 'createdAt', 'updatedAt'];
          const userData: any = {};

          for (const field of allowedFields) {
            if ((user as any)[field] !== undefined) {
              userData[field] = (user as any)[field];
            }
          }

          await db.transaction(async (tx) => {
            const [result] = await tx
              .select({ count: sql<number>`count(*)` })
              .from(schema.users);
            
            if (result && Number(result.count) === 0) {
              userData.isSystemAdmin = true;
            }
          });

          return { data: userData };
        },
      },
    },
  },
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
  // Secret for session encryption/signing
  secret,
  // Base URL for auth endpoints
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000/api/auth",
  trustedOrigins: process.env.AUTH_TRUSTED_ORIGINS 
    ? process.env.AUTH_TRUSTED_ORIGINS.split(',').map(o => o.trim())
    : [
        "http://localhost:5180", // Admin Frontend
        "http://localhost:3000", // Swagger / Local API
        "http://localhost",       // Tests
        "http://localhost:5174",
      ],
});
