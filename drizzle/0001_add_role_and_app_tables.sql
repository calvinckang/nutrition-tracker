-- Add role to user table (Better Auth user)
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'user' NOT NULL;
--> statement-breakpoint
-- Drop demo task table
DROP TABLE IF EXISTS "task";
--> statement-breakpoint
-- Enums for app schema
CREATE TYPE "supermarket" AS ENUM ('Mercadona', 'Carrefour');
--> statement-breakpoint
CREATE TYPE "serving_unit" AS ENUM ('g', 'ml', 'piece', 'serving');
--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM ('admin', 'user');
--> statement-breakpoint
-- Food catalog
CREATE TABLE "food_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"brand" text,
	"supermarket" "supermarket",
	"ingredients" text,
	"comment" text,
	"serving_amount" numeric(10, 2) DEFAULT '100' NOT NULL,
	"serving_unit" "serving_unit" DEFAULT 'g' NOT NULL,
	"calories_kcal" numeric(10, 2) NOT NULL,
	"fat_g" numeric(10, 2) NOT NULL,
	"saturated_fat_g" numeric(10, 2) NOT NULL,
	"carbohydrate_g" numeric(10, 2) NOT NULL,
	"sugars_g" numeric(10, 2) NOT NULL,
	"fiber_g" numeric(10, 2) NOT NULL,
	"protein_g" numeric(10, 2) NOT NULL,
	"salt_g" numeric(10, 2) NOT NULL,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Meals
CREATE TABLE "meals" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Meal items
CREATE TABLE "meal_items" (
	"id" text PRIMARY KEY NOT NULL,
	"meal_id" text NOT NULL,
	"food_entry_id" text NOT NULL,
	"amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"unit" "serving_unit" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "food_entries" ADD CONSTRAINT "food_entries_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "meals" ADD CONSTRAINT "meals_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "meal_items" ADD CONSTRAINT "meal_items_meal_id_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "meal_items" ADD CONSTRAINT "meal_items_food_entry_id_food_entries_id_fk" FOREIGN KEY ("food_entry_id") REFERENCES "public"."food_entries"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "food_entries_created_by_user_id_idx" ON "food_entries" USING btree ("created_by_user_id");
--> statement-breakpoint
CREATE INDEX "meals_user_id_idx" ON "meals" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "meals_user_id_date_idx" ON "meals" USING btree ("user_id","date");
--> statement-breakpoint
CREATE INDEX "meal_items_meal_id_idx" ON "meal_items" USING btree ("meal_id");
--> statement-breakpoint
CREATE INDEX "meal_items_food_entry_id_idx" ON "meal_items" USING btree ("food_entry_id");
