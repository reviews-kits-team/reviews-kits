import { describe, expect, it, beforeAll, afterAll, beforeEach, spyOn } from "bun:test";
import { testDb, clearDatabase } from "../IntegrationSetup";
import { apiKeysRouter } from "../../../src/interface/routes/api-keys";
import { container } from '@/infrastructure/container';
import { testRepositories } from '../../testContainer';
import { auth } from "../../../src/infrastructure/auth/auth";
import { sql } from "drizzle-orm";

describe("API Keys Integration", () => {
  const userId = "00000000-0000-0000-0000-000000000001";
  const getSessionSpy = spyOn(auth.api, "getSession") as any;

  beforeAll(async () => {
    await clearDatabase();
  });

  afterAll(() => {
    getSessionSpy.mockRestore();
  });

  beforeEach(async () => {
    await clearDatabase();
    getSessionSpy.mockReset();
    getSessionSpy.mockImplementation(async () => ({
      user: { id: userId, email: "test@example.com" },
      session: { userId }
    }));
    // Pre-create user and keys if needed, but we test the rotation
    await testDb.execute(sql.raw(`INSERT INTO "users" (id, name, email) VALUES ('${userId}', 'Test User', 'test@example.com')`));
  });

  it("should generate initial keys when rotating for the first time", async () => {
    const res = await apiKeysRouter.request("/rotate", {
      method: "POST",
    }, {
      // Mock session in context
      session: { user: { id: userId } }
    } as any);

    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(data.publicKey).toBeDefined();
    expect(data.secretKey).toBeDefined();
    expect(data.publicKey).toStartWith("rk_pk_");
    expect(data.secretKey).toStartWith("rk_sk_");

    // Verify in DB
    const keys = await testRepositories.apiKeyRepository.findByUser(userId);
    expect(keys).toHaveLength(2);
    expect(keys.every(k => k.getProps().isActive)).toBe(true);
  });

  it("should list active keys for a user", async () => {
    // Generate some keys first
    await container.generateUserApiKeys.execute(userId);

    const res = await apiKeysRouter.request("/", {
      method: "GET",
    }, {
      session: { user: { id: userId } }
    } as any);

    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(data.publicKey).toBeDefined();
    expect(data.secretKey).toBeDefined();
  });

  it("should deactivate old keys upon rotation", async () => {
    // 1. Generate first batch
    await apiKeysRouter.request("/rotate", { method: "POST" }, { session: { user: { id: userId } } } as any);
    const firstKeys = await testRepositories.apiKeyRepository.findByUser(userId);
    expect(firstKeys.filter(k => k.getProps().isActive)).toHaveLength(2);

    // 2. Rotate
    await apiKeysRouter.request("/rotate", { method: "POST" }, { session: { user: { id: userId } } } as any);
    
    // 3. Verify
    const allKeys = await testRepositories.apiKeyRepository.findByUser(userId);
    expect(allKeys).toHaveLength(4);
    expect(allKeys.filter(k => k.getProps().isActive)).toHaveLength(2);
    
    // Old keys should be inactive
    const originalKeys = allKeys.filter(k => firstKeys.find(fk => fk.id === k.id));
    expect(originalKeys.every(k => !k.getProps().isActive)).toBe(true);
  });
});
