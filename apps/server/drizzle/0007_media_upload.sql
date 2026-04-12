-- Add profile photo and video URL fields to testimonials table
ALTER TABLE "testimonials" ADD COLUMN "author_photo_url" text;
ALTER TABLE "testimonials" ADD COLUMN "video_url" text;

CREATE INDEX "idx_testimonials_author_photo_url" ON "testimonials" USING btree ("author_photo_url");
CREATE INDEX "idx_testimonials_video_url" ON "testimonials" USING btree ("video_url");
