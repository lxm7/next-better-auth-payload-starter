import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'fr');
  CREATE TYPE "public"."enum_landing_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__landing_page_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__landing_page_v_published_locale" AS ENUM('en', 'fr');
  CREATE TABLE "todo_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"color" varchar,
  	"archived" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "todo_categories_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "landing_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_status" "enum_landing_page_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "landing_page_locales" (
  	"heading" varchar,
  	"subheading" varchar,
  	"body" jsonb,
  	"cta_primary_label" varchar,
  	"cta_secondary_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_landing_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version__status" "enum__landing_page_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__landing_page_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_landing_page_v_locales" (
  	"version_heading" varchar,
  	"version_subheading" varchar,
  	"version_body" jsonb,
  	"version_cta_primary_label" varchar,
  	"version_cta_secondary_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "todo_categories_id" integer;
  ALTER TABLE "todo_categories_locales" ADD CONSTRAINT "todo_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."todo_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_page_locales" ADD CONSTRAINT "landing_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_page_v_locales" ADD CONSTRAINT "_landing_page_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_page_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "todo_categories_key_idx" ON "todo_categories" USING btree ("key");
  CREATE INDEX "todo_categories_updated_at_idx" ON "todo_categories" USING btree ("updated_at");
  CREATE INDEX "todo_categories_created_at_idx" ON "todo_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "todo_categories_locales_locale_parent_id_unique" ON "todo_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "landing_page__status_idx" ON "landing_page" USING btree ("_status");
  CREATE UNIQUE INDEX "landing_page_locales_locale_parent_id_unique" ON "landing_page_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_landing_page_v_version_version__status_idx" ON "_landing_page_v" USING btree ("version__status");
  CREATE INDEX "_landing_page_v_created_at_idx" ON "_landing_page_v" USING btree ("created_at");
  CREATE INDEX "_landing_page_v_updated_at_idx" ON "_landing_page_v" USING btree ("updated_at");
  CREATE INDEX "_landing_page_v_snapshot_idx" ON "_landing_page_v" USING btree ("snapshot");
  CREATE INDEX "_landing_page_v_published_locale_idx" ON "_landing_page_v" USING btree ("published_locale");
  CREATE INDEX "_landing_page_v_latest_idx" ON "_landing_page_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_landing_page_v_locales_locale_parent_id_unique" ON "_landing_page_v_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_todo_categories_fk" FOREIGN KEY ("todo_categories_id") REFERENCES "public"."todo_categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_todo_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("todo_categories_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "todo_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "todo_categories_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_page" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_page_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_landing_page_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_landing_page_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "todo_categories" CASCADE;
  DROP TABLE "todo_categories_locales" CASCADE;
  DROP TABLE "landing_page" CASCADE;
  DROP TABLE "landing_page_locales" CASCADE;
  DROP TABLE "_landing_page_v" CASCADE;
  DROP TABLE "_landing_page_v_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_todo_categories_fk";
  
  DROP INDEX "payload_locked_documents_rels_todo_categories_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "todo_categories_id";
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_landing_page_status";
  DROP TYPE "public"."enum__landing_page_v_version_status";
  DROP TYPE "public"."enum__landing_page_v_published_locale";`)
}
