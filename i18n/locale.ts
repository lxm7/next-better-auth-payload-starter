import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { type Locale, routing } from "./routing";

// Every page and layout under `[locale]` receives its segment as unvalidated
// input. The layout's own check does not cover its pages — Next renders them
// in parallel, and it does not narrow their `params` type either — so each
// one calls this rather than trusting the URL.
//
// Not a TS `asserts` signature: it resolves `params` and returns the narrowed
// locale, since a promise can't be narrowed in place. An unknown locale is a
// 404, not a fallback to the default, so a typo'd prefix never renders as
// `en`. Callers still call `setRequestLocale` themselves.
//
// next-intl deprecates `setRequestLocale` in favour of `next/root-params`,
// which would let `i18n/request.ts` read and validate the locale once and
// retire both this helper and the per-page calls. Blocked for now: Next's
// typegen (16.3.6) strips route groups before finding root layouts, so
// Payload's `app/(payload)/layout.tsx` resolves to `/`, shadows
// `app/[locale]/layout.tsx`, and no `locale` root param is generated.
export async function assertLocale(
  params: Promise<{ locale: string }>
): Promise<Locale> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return locale;
}
