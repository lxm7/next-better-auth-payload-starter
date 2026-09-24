import type { CollectionConfig } from "payload";

// People who edit CMS content. Deliberately not the app's users: those live in
// Better Auth's `user` table in `neondb`, these in `editors` in the `cms`
// database, and neither references the other. If editors ever need to be app
// users, Better Auth becomes the authority and this collection is fed from it,
// not merged with it.
export const Editors: CollectionConfig = {
  slug: "editors",
  admin: {
    useAsTitle: "email",
  },
  // Payload's defaults, spelled out so the security posture is reviewable
  // here rather than in node_modules.
  auth: {
    tokenExpiration: 7200,
    maxLoginAttempts: 5,
    lockTime: 600_000,
  },
  // Email and password come from `auth`; no extra fields yet.
  fields: [],
};
