import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { db } from "../database/db";
import * as schema from "../database/schema";

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

          const userCount = await db.select().from(schema.users);
          if (userCount.length === 0) {
            userData.isSystemAdmin = true;
          }

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
  secret: process.env.BETTER_AUTH_SECRET,
  // Base URL for auth endpoints
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000/api/auth",
  trustedOrigins: [
    "http://localhost:5180", // Admin Frontend
    "http://localhost:3000", // Swagger / Local API
    "http://localhost",       // Tests
    "http://localhost:5174",
  ],
});
