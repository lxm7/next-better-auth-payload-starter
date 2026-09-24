import { getPayload } from "payload";
import { type Locale, routing } from "../i18n/routing";
import config from "../payload.config";
import { DISABLE_REVALIDATE } from "./hooks/revalidate-cms";

// Seeds the CMS with the site's starting copy, so a fresh database (a new Neon
// branch, a new environment) begins with the same content. The values live
// here as data, so seeding has no dependency on any other system.
//
//   pnpm payload run cms/seed.ts            # only fills an empty landing page
//   pnpm payload run cms/seed.ts --force    # overwrites editorial changes
//
// Writes through the Local API, so validation, versions and hooks all run, and
// publishes each locale (the app only reads published content). The one hook
// skipped is cache revalidation: there's no Next cache in a CLI process, and a
// deployed site picks the content up within its `revalidate` window.

interface LandingPageSeed {
  heading: string;
  subheading: string;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
}

// Keyed by `Locale`: adding a locale to `i18n/routing.ts` fails the typecheck
// here until it has seed copy too.
const LANDING_PAGE: Record<Locale, LandingPageSeed> = {
  en: {
    heading: "Better Auth Starter",
    subheading:
      "This is a starter project for Better Auth. It is a simple project that uses Better Auth to authenticate users.",
    ctaPrimaryLabel: "Login",
    ctaSecondaryLabel: "Signup",
  },
  fr: {
    heading: "Démarrage Better Auth",
    subheading:
      "Projet de départ pour Better Auth. Un projet simple qui utilise Better Auth pour authentifier les utilisateurs.",
    ctaPrimaryLabel: "Connexion",
    ctaSecondaryLabel: "Inscription",
  },
};

const force = process.argv.includes("--force");
const payload = await getPayload({ config });

try {
  const existing = await payload.findGlobal({
    slug: "landing-page",
    locale: "en",
    draft: false,
  });

  if (existing.heading && !force) {
    payload.logger.info(
      "Landing page already has published content; nothing seeded. Pass --force to overwrite it."
    );
  } else {
    for (const locale of routing.locales) {
      await payload.updateGlobal({
        slug: "landing-page",
        locale,
        data: { ...LANDING_PAGE[locale], _status: "published" },
        context: { [DISABLE_REVALIDATE]: true },
      });
      payload.logger.info(`Published landing page (${locale}).`);
    }
  }
} finally {
  // The Postgres pool would otherwise keep the process alive.
  await payload.destroy();
}
