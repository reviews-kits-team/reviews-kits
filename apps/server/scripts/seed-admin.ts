import { auth } from "../src/infrastructure/auth/auth";
import { db } from "../src/infrastructure/database/db";
import { users } from "../src/infrastructure/database/schema";
import { eq } from "drizzle-orm";

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@reviewskits.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin_secure_password";
  
  console.log(`[SEED] Starting admin seeder for email: ${adminEmail}`);

  try {
    // 1. Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);

    if (existingUser.length > 0) {
      console.log(`[SEED] User ${adminEmail} already exists. Enforcing isSystemAdmin = true...`);
      await db.update(users)
        .set({ isSystemAdmin: true })
        .where(eq(users.email, adminEmail));
      console.log(`[SEED] Admin privileges granted successfully.`);
    } else {
      console.log(`[SEED] Creating new admin account...`);
      
      // 2. Create the user using Better-Auth API to handle password hashing
      const res = await auth.api.signUpEmail({
        body: {
          email: adminEmail,
          password: adminPassword,
          name: "System Administrator",
        },
        // Provide empty headers as required by Better-Auth internal API call
        headers: new Headers()
      });

      if (!res?.user) {
        throw new Error("Failed to create user via Better-Auth.");
      }

      // 3. Force the isSystemAdmin flag to true
      // (Even if it wasn't the very first user in the DB)
      await db.update(users)
        .set({ isSystemAdmin: true, emailVerified: true })
        .where(eq(users.email, adminEmail));

      console.log(`[SEED] Super Admin created successfully!`);
      console.log(`[SEED] Email: ${adminEmail}`);
      console.log(`[SEED] Password: ${adminPassword}`);
    }

  } catch (error) {
    console.error("[SEED] Error seeding admin:", error);
  } finally {
    process.exit(0);
  }
}

seedAdmin();
