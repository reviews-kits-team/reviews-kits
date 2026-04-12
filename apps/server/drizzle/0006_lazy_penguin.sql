-- Add GDPR consent fields to testimonials table
ALTER TABLE "testimonials" ADD COLUMN "consent_public" boolean DEFAULT false;
ALTER TABLE "testimonials" ADD COLUMN "consent_internal" boolean DEFAULT false;
ALTER TABLE "testimonials" ADD COLUMN "consented_at" timestamp;

CREATE INDEX "idx_testimonials_consent_public" ON "testimonials" USING btree ("consent_public");
CREATE INDEX "idx_testimonials_consent_internal" ON "testimonials" USING btree ("consent_internal");
