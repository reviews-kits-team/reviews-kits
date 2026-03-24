import { describe, expect, it, beforeEach } from "bun:test";
import { testDb, clearDatabase } from "../IntegrationSetup";
import { publicRouter } from "../../../src/interface/routes/public";
import { container } from "../../../src/infrastructure/container";
import { Form } from "../../../src/domain/entities/Form";
import { Slug } from "../../../src/domain/value-objects/Slug";
import { sql } from "drizzle-orm";

describe("Security Checks Integration", () => {
  const userId = "11111111-1111-1111-1111-111111111111";
  const publicFormId = "rk_frm_live_sec";

  beforeEach(async () => {
    await clearDatabase();
    await testDb.execute(sql.raw(`INSERT INTO "users" (id, name, email) VALUES ('${userId}', 'Form Owner', 'sec@example.com') ON CONFLICT DO NOTHING`));
    
    const form = new Form({
      id: "33333333-3333-3333-3333-333333333333",
      userId,
      name: "Security Test Form",
      slug: Slug.create("sec-form"),
      publicId: publicFormId,
      config: {}
    });
    await container.formRepository.save(form);
  });

  it("should reject review content exceeding 5000 characters (P0-3)", async () => {
    const longContent = "a".repeat(5001);
    const res = await publicRouter.request("/reviews", {
      method: "POST",
      body: JSON.stringify({
        formId: publicFormId,
        content: longContent,
        authorName: "Attacker"
      }),
      headers: { "Content-Type": "application/json" }
    });

    expect(res.status).toBe(400);
    const data = await res.json() as any;
    expect(data.error).toContain("content is too long");
  });

  it("should reject authorUrl with unsafe protocols like javascript: (P0-4)", async () => {
    const unsafeUrls = [
      "javascript:alert('XSS')",
      "data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4=",
      "vbscript:msgbox('XSS')",
      "ftp://example.com"
    ];

    for (const authorUrl of unsafeUrls) {
      const res = await publicRouter.request("/reviews", {
        method: "POST",
        body: JSON.stringify({
          formId: publicFormId,
          content: "Nice!",
          authorName: "Attacker",
          authorUrl
        }),
        headers: { "Content-Type": "application/json" }
      });

    if (res.status === 500) {
      const body = await res.json();
      console.error('500 Error Body:', body);
    }
    expect(res.status).toBe(400);
      const data = await res.json() as any;
      // Depending on if it's invalid URL format or fails the protocol check
      expect(data.error).toBeDefined();
    }
  });

  it("should accept valid authorUrl with http or https", async () => {
    const safeUrls = [
      "https://google.com",
      "http://localhost:3000",
      "https://sub.domain.co.uk/path?query=1"
    ];

    for (const authorUrl of safeUrls) {
      const res = await publicRouter.request("/reviews", {
        method: "POST",
        body: JSON.stringify({
          formId: publicFormId,
          content: "Valid review",
          authorName: "Good User",
          authorUrl
        }),
        headers: { "Content-Type": "application/json" }
      });

      expect(res.status).toBe(201);
    }
  });
  
  it("should rate limit requests to 5 per 15 minutes (P0-5)", async () => {
    // Send 5 valid requests
    for (let i = 0; i < 5; i++) {
        const res = await publicRouter.request("/reviews", {
            method: "POST",
            body: JSON.stringify({
                formId: publicFormId,
                content: `Review ${i}`,
                authorName: "Good User"
            }),
            headers: { "Content-Type": "application/json" }
        });
        expect(res.status).toBe(201);
    }

    // The 6th request should be rate limited
    const res = await publicRouter.request("/reviews", {
        method: "POST",
        body: JSON.stringify({
            formId: publicFormId,
            content: "One too many",
            authorName: "Spammer"
        }),
        headers: { "Content-Type": "application/json" }
    });

    expect(res.status).toBe(429);
    const data = await res.json() as any;
    expect(data.error).toBe("Too many requests, please try again later.");
  });
});
