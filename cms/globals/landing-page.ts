import type { GlobalConfig } from "payload";
import { isEditor } from "../access";

// A global, not a collection: there is exactly one landing page, which matches
// `ContentSource.getLandingPage(locale)` taking no slug. More marketing pages
// would be a `pages` collection beside this, not a reshaping of it.
export const LandingPage: GlobalConfig = {
  slug: "landing-page",
  // Closed to anonymous REST/GraphQL. The app reads through the Local API,
  // which doesn't consult these rules, so the site doesn't need public read.
  // Opening it later is this one function, filtered to `_status: published`.
  access: {
    read: isEditor,
    update: isEditor,
  },
  // Draft/publish, like Hygraph's stages: editors stage copy without it going
  // live, and the adapter only ever asks for the published version.
  versions: {
    drafts: true,
    max: 20,
  },
  fields: [
    {
      name: "heading",
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "subheading",
      type: "text",
      localized: true,
    },
    {
      name: "body",
      type: "richText",
      localized: true,
    },
    {
      name: "ctaPrimaryLabel",
      label: "Primary CTA label",
      type: "text",
      localized: true,
    },
    {
      name: "ctaSecondaryLabel",
      label: "Secondary CTA label",
      type: "text",
      localized: true,
    },
  ],
};
