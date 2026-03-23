ALTER TABLE "api_keys" DROP CONSTRAINT "api_keys_key_unique";--> statement-breakpoint
DROP INDEX "idx_api_keys_key";--> statement-breakpoint
ALTER TABLE "api_keys" ADD COLUMN "key_hash" text NOT NULL;--> statement-breakpoint
ALTER TABLE "api_keys" ADD COLUMN "key_prefix" text NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_api_keys_hash" ON "api_keys" USING btree ("key_hash");--> statement-breakpoint
ALTER TABLE "api_keys" DROP COLUMN "key";--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_key_hash_unique" UNIQUE("key_hash");