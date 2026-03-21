import { describe, expect, it } from "bun:test";
import { ApiKey, type ApiKeyProps } from "../../../../src/domain/entities/ApiKey";

describe("ApiKey Entity", () => {
  const validProps: ApiKeyProps = {
    id: "key-1",
    userId: "user-1",
    key: "rk_pk_live_123456",
    type: 'public',
    isActive: true,
  };

  describe("Creation", () => {
    it("should create an ApiKey with all properties", () => {
      const apiKey = new ApiKey(validProps);
      
      expect(apiKey.id).toBe(validProps.id);
      expect(apiKey.userId).toBe(validProps.userId);
      expect(apiKey.key).toBe(validProps.key);
      expect(apiKey.type).toBe(validProps.type);
      expect(apiKey.getProps().isActive).toBe(true);
      expect(apiKey.createdAt).toBeInstanceOf(Date);
    });

    it("should initialize default values if not provided", () => {
      const apiKey = new ApiKey({ ...validProps, isActive: undefined as any });
      
      expect(apiKey.getProps().isActive).toBe(true);
      expect(apiKey.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("Status Behavioral", () => {
    it("should deactivate the key", () => {
      const apiKey = new ApiKey(validProps);
      apiKey.deactivate();
      expect(apiKey.getProps().isActive).toBe(false);
    });

    it("should activate the key", () => {
      const apiKey = new ApiKey({ ...validProps, isActive: false });
      apiKey.activate();
      expect(apiKey.getProps().isActive).toBe(true);
    });
  });

  describe("Usage Tracking", () => {
    it("should update lastUsed date", async () => {
      const apiKey = new ApiKey(validProps);
      expect(apiKey.getProps().lastUsed).toBeUndefined();

      await new Promise(r => setTimeout(r, 10));
      apiKey.updateLastUsed();

      expect(apiKey.getProps().lastUsed).toBeInstanceOf(Date);
    });
  });
});
