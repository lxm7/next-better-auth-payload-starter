import type { Locale } from "@/i18n/routing";

// The app's shape of CMS content, not any CMS's wire format. Simple fields stay
// plain types, so swapping the CMS behind `index.ts` never touches a consumer.
// Rich content, when a page first renders it, may use Payload's own Lexical
// type rather than a home-grown one: re-implementing its converters to stay
// neutral would cost more than another CMS move is likely to.

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
  // Categories are archived, never deleted, because todos reference them by
  // key. Pickers hide archived ones; resolving an existing todo's key must not.
  archived: boolean;
}

export interface ContentSource {
  // Both methods return an empty result rather than throwing: a CMS outage
  // should degrade the page, not take it down. Callers fall back to their
  // next-intl messages.
  getLandingPage(locale: Locale): Promise<LandingPageContent | null>;
  getTodoCategories(locale: Locale): Promise<TodoCategory[]>;
}
