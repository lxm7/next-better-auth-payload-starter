import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import { Editors } from "./cms/collections/editors";
import { TodoCategories } from "./cms/collections/todo-categories";
import { LandingPage } from "./cms/globals/landing-page";
import { type Locale, routing } from "./i18n/routing";

// Keyed by the app's `Locale`, so adding a locale to `i18n/routing.ts` fails
// the typecheck here until the CMS gets a label for it too.
const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};

// Fails the boot (and the build, which imports this config) rather than
// starting Payload with an empty secret or no database.
const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set; Payload cannot start without it.`);
  }
  return value;
};

export default buildConfig({
  secret: requireEnv("PAYLOAD_SECRET"),
  db: postgresAdapter({
    // Payload owns the whole `cms` database, a sibling of the app's `neondb`
    // on the same Neon branch. A separate database rather than a schema,
    // because `schemaName` is experimental and breaks on any table or enum
    // name shared with `public`.
    pool: { connectionString: requireEnv("CMS_DATABASE_URL") },
    // Schema changes only ever go through committed migrations, never a dev
    // push, so every environment's DDL is reviewable.
    push: false,
    // Explicit: Payload's default, `./migrations`, is Drizzle's folder for
    // the app database.
    migrationDir: "cms/migrations",
  }),
  routes: {
    admin: "/admin",
    // Kept off `/api`, which belongs to the app (`/api/auth`,
    // `/api/accept-invitation`). GraphQL lands at `/cms-api/graphql`.
    api: "/cms-api",
  },
  admin: {
    user: Editors.slug,
  },
  editor: lexicalEditor(),
  // The app's locales are the source of truth; the CMS mirrors them.
  localization: {
    locales: routing.locales.map((code) => ({
      code,
      label: LOCALE_LABELS[code],
    })),
    defaultLocale: routing.defaultLocale,
    // Off: a missing French field comes back null, and the page falls back to
    // its French next-intl message rather than to English CMS copy.
    fallback: false,
  },
  collections: [Editors, TodoCategories],
  globals: [LandingPage],
  typescript: {
    outputFile: "cms/payload-types.ts",
  },
});
