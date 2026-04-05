import { expect, it, describe, spyOn, beforeEach, afterAll } from "bun:test";
import { OpenAPIHono } from "@hono/zod-openapi";
import { dashboardRouter } from "../../../src/interface/routes/dashboard";
import { auth } from "../../../src/infrastructure/auth/auth";
import { testDb, clearDatabase } from "../IntegrationSetup";
import { testRepositories } from '../../testContainer';
import { Form } from "../../../src/domain/entities/Form";
import { Testimonial } from "../../../src/domain/entities/Testimonial";
import { Slug } from "../../../src/domain/value-objects/Slug";
import { Rating } from "../../../src/domain/value-objects/Rating";
import { Email } from "../../../src/domain/value-objects/Email";
import { sql } from "drizzle-orm";

describe("Dashboard Stats Integration", () => {
    const app = new OpenAPIHono();
    app.route("/api/v1/dashboard", dashboardRouter);

    const getSessionSpy = spyOn(auth.api, "getSession") as any;
    const userId = "11111111-1111-1111-1111-111111111111";

    afterAll(() => {
        getSessionSpy.mockRestore();
    });

    beforeEach(async () => {
        await clearDatabase();
        // Setup User
        await testDb.execute(sql.raw(`INSERT INTO "users" (id, name, email) VALUES ('${userId}', 'Stats User', 'stats@example.com') ON CONFLICT DO NOTHING`));
        
        // Mock Auth
        getSessionSpy.mockImplementation((async () => ({
            user: { id: userId, email: "stats@example.com" },
            session: { id: "s1", userId }
        })) as any);
    });

    it("should return correct aggregate stats for the user", async () => {
        // 1. Setup Data: 2 forms, 3 testimonials
        const form1 = new Form({
            id: "22222222-2222-2222-2222-222222222222",
            userId,
            name: "Form 1",
            slug: Slug.create("form-1"),
            publicId: "pub-1",
            config: {}
        });
        const form2 = new Form({
            id: "33333333-3333-3333-3333-333333333333",
            userId,
            name: "Form 2",
            slug: Slug.create("form-2"),
            publicId: "pub-2",
            config: {}
        });
        await testRepositories.formRepository.save(form1);
        await testRepositories.formRepository.save(form2);

        const t1 = new Testimonial({
            id: "44444444-4444-4444-4444-444444444444",
            userId,
            formId: "22222222-2222-2222-2222-222222222222",
            content: "Great!",
            rating: Rating.create(5),
            status: "approved",
            authorName: "John",
            authorEmail: Email.create("john@example.com")
        });
        const t2 = new Testimonial({
            id: "55555555-5555-5555-5555-555555555555",
            userId,
            formId: "22222222-2222-2222-2222-222222222222",
            content: "Good",
            rating: Rating.create(4),
            status: "approved",
            authorName: "Jane",
            authorEmail: Email.create("jane@example.com")
        });
        const t3 = new Testimonial({
            id: "66666666-6666-6666-6666-666666666666",
            userId,
            formId: "33333333-3333-3333-3333-333333333333",
            content: "Okay",
            rating: Rating.create(3),
            status: "pending", // Stats should count all? Or only approved? 
            // In dashboardController / useCase, we usually count all or according to logic.
            authorName: "Bob",
            authorEmail: Email.create("bob@example.com")
        });
        await testRepositories.testimonialRepository.save(t1);
        await testRepositories.testimonialRepository.save(t2);
        await testRepositories.testimonialRepository.save(t3);

        // 2. Act
        const res = await app.request("/api/v1/dashboard/stats");

        // 3. Assert
        expect(res.status).toBe(200);
        const stats = await res.json() as any;
        
        // Expectations based on typical DashboardStatsUseCase logic
        // (totalReviews = 3, averageRating = (5+4+3)/3 = 4)
        expect(stats.totalReviews).toBe(3);
        expect(stats.averageRating).toBe(4);
        expect(stats.uniqueRespondents).toBe(3);
    });

    it("should return zeros when user has no data", async () => {
        const res = await app.request("/api/v1/dashboard/stats");
        expect(res.status).toBe(200);
        const stats = await res.json() as any;
        expect(stats.totalReviews).toBe(0);
        expect(stats.averageRating).toBe(0);
    });
});
