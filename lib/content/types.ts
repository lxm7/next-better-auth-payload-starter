import type { Locale } from "@/i18n/routing";

// The app's shape of CMS content, deliberately not Hygraph's. No `__typename`,
// no `stage`, no `localizations`, and `color` already flattened from Hygraph's
// object-typed Color field to a plain hex string. A Strapi adapter later
// implements the same interface without a single consumer changing.

export interface LandingPageContent {
  heading: string;
  // Nullable rather than optional: these fields exist on the model but an
  // editor may leave them empty, and the caller has to handle that either way.
  subheading: string | null;
  ctaPrimaryLabel: string | null;
  ctaSecondaryLabel: string | null;
}

export interface TodoCategory {
  // The stable, unlocalised join key stored on `todo.category_key` in Postgres.
  key: string;
  // The localised, editor-facing label — the only part that varies by locale.
  name: string;
  // Hex, e.g. "#2563eb". Null when the editor left the colour unset.
  color: string | null;
}

export interface ContentSource {
  // Both methods return an empty result rather than throwing: a CMS outage
  // should degrade the page, not take it down. Callers fall back to their
  // next-intl messages.
  getLandingPage(locale: Locale): Promise<LandingPageContent | null>;
  getTodoCategories(locale: Locale): Promise<TodoCategory[]>;
}
