import { expect, it, describe, spyOn, beforeEach, afterAll } from "bun:test";
import { Hono } from "hono";
import webhooksRouter from "../../../src/interface/routes/webhooks";
import { auth } from "../../../src/infrastructure/auth/auth";
import { testDb, clearDatabase } from "../IntegrationSetup";
import { testRepositories } from '../../testContainer';
import { Webhook } from "../../../src/domain/entities/Webhook";
import { sql } from "drizzle-orm";

describe("Webhooks CRUD Integration", () => {
    const userId = "11111111-1111-1111-1111-111111111111";
    const app = new Hono<{ Variables: { session: any } }>();
    app.use("*", async (c, next) => {
        c.set("session", { user: { id: userId } });
        await next();
    });
    app.route("/api/v1/webhooks", webhooksRouter);

    const getSessionSpy = spyOn(auth.api, "getSession") as any;

    afterAll(() => {
        getSessionSpy.mockRestore();
    });

    beforeEach(async () => {
        await clearDatabase();
        await testDb.execute(sql.raw(`INSERT INTO "users" (id, name, email) VALUES ('${userId}', 'Web User', 'web@example.com') ON CONFLICT DO NOTHING`));
        
        getSessionSpy.mockImplementation((async () => ({
            user: { id: userId, email: "web@example.com" },
            session: { id: "s1", userId }
        })) as any);
    });

    it("should create and list webhooks", async () => {
        // 1. Create
        const createRes = await app.request("/api/v1/webhooks", {
            method: "POST",
            body: JSON.stringify({
                url: "https://example.com/webhook",
                events: ["testimonial.created"]
            }),
            headers: { "Content-Type": "application/json" }
        });
        expect(createRes.status).toBe(201);
        const created = await createRes.json() as any;
        expect(created.url).toBe("https://example.com/webhook");

        // 2. List
        const listRes = await app.request("/api/v1/webhooks");
        expect(listRes.status).toBe(200);
        const list = await listRes.json() as any[];
        expect(list.length).toBe(1);
        expect(list[0].id).toBe(created.id);
    });

    it("should delete a webhook", async () => {
        const webhook = new Webhook({
            id: "22222222-2222-2222-2222-222222222222",
            userId,
            url: "https://test.com",
            events: ["*"],
            secret: "sec",
            isActive: true
        });
        await testRepositories.webhookRepository.save(webhook);

        const delRes = await app.request(`/api/v1/webhooks/${webhook.getId()}`, {
            method: "DELETE"
        });
        expect(delRes.status).toBe(200);

        const listRes = await app.request("/api/v1/webhooks");
        const list = await listRes.json() as any[];
        expect(list.length).toBe(0);
    });

    it("should test a webhook", async () => {
        const fetchSpy = spyOn(global as any, "fetch").mockImplementation(() => 
            Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }))
        );

        const webhook = new Webhook({
            id: "33333333-3333-3333-3333-333333333333",
            userId,
            url: "https://test.com/payload",
            events: ["*"],
            secret: "sec",
            isActive: true
        });
        await testRepositories.webhookRepository.save(webhook);

        const testRes = await app.request(`/api/v1/webhooks/${webhook.getId()}/test`, {
            method: "POST"
        });
        
        expect(testRes.status).toBe(200);
        expect(fetchSpy).toHaveBeenCalled();
        
        fetchSpy.mockRestore();
    });
});
