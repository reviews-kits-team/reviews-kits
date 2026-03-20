import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization, bearer } from "better-auth/plugins";
import { db } from "../database/db";
import * as schema from "../database/schema";
import { ac, roles } from "./permissions";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
      organization: schema.organizations,
      member: schema.members,
      invitation: schema.invitations,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    organization({
      // Configure roles with required properties for Better-auth v1.5+
      roles,
      ac,
      allowSetDefaultOrganization: true,
      sendInvitationEmail: async (data) => {
        // Here we would integrate with an email provider (Resend, Postmark, etc.)
        // For now, we'll log it for development purposes
        console.log(`
          📨 Invitation Email Sent:
          To: ${data.email}
          Role: ${data.role}
          Organization: ${data.organization.name}
          Inviter: ${data.inviter.user.name}
          Link: ${process.env.BETTER_AUTH_URL}/accept-invitation/${data.id}
        `);
      },
    }),
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
    "http://172.20.0.1:5180",
    "http://localhost:3000", // Swagger / Local API
    "http://localhost",       // Tests
  ],
});
