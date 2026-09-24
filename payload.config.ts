import { postgresAdapter } from "@payloadcms/db-postgres";
import { buildConfig } from "payload";
import { Editors } from "./cms/collections/editors";

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
  collections: [Editors],
  typescript: {
    outputFile: "cms/payload-types.ts",
  },
});
