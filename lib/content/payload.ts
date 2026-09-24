import "server-only";
import config from "@payload-config";
import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import { CMS_CACHE_TAG } from "@/cms/hooks/revalidate-cms";
import type { Locale } from "@/i18n/routing";
import type { ContentSource, LandingPageContent, TodoCategory } from "./types";

// Payload runs in-process, so these are Local API calls, not HTTP: no `fetch`
// cache applies, and `unstable_cache` does the job instead. Publishing expires
// `CMS_CACHE_TAG` (see `cms/hooks/revalidate-cms.ts`); the `revalidate` window
// is only a backstop for a missed hook.
const CACHE_OPTIONS = { tags: [CMS_CACHE_TAG], revalidate: 300 };

// The cached readers throw on failure and are wrapped below. `unstable_cache`
// only stores a value that resolves, so a database blip degrades one request
// to the fallback copy instead of pinning `null` for the whole window.

const readLandingPage = unstable_cache(
  async (locale: Locale): Promise<LandingPageContent | null> => {
    const payload = await getPayload({ config });
    const doc = await payload.findGlobal({
      slug: "landing-page",
      locale,
      draft: false,
      depth: 0,
      // `body` is left out until a page renders it.
      select: {
        heading: true,
        subheading: true,
        ctaPrimaryLabel: true,
        ctaSecondaryLabel: true,
      },
    });

    // The generated type says `heading: string`, but with fallback off a
    // locale that was never published comes back empty. A content problem,
    // not an outage, so it warns rather than errors.
    if (!doc.heading) {
      console.warn(
        `[cms:payload] getLandingPage: no published heading for locale "${locale}"`
      );
      return null;
    }

    return {
      heading: doc.heading,
      subheading: doc.subheading || null,
      ctaPrimaryLabel: doc.ctaPrimaryLabel || null,
      ctaSecondaryLabel: doc.ctaSecondaryLabel || null,
    };
  },
  ["cms", "landing-page"],
  CACHE_OPTIONS
);

const readTodoCategories = unstable_cache(
  async (locale: Locale): Promise<TodoCategory[]> => {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "todo-categories",
      locale,
      depth: 0,
      pagination: false,
      sort: "key",
      select: { key: true, name: true, color: true, archived: true },
    });

    return docs.map((category) => {
      // Same caveat as `heading`: a category with no name in this locale
      // still has to render somewhere, so its key stands in.
      if (!category.name) {
        console.warn(
          `[cms:payload] getTodoCategories: "${category.key}" has no name for locale "${locale}"`
        );
      }
      return {
        key: category.key,
        name: category.name || category.key,
        color: category.color || null,
        archived: category.archived ?? false,
      };
    });
  },
  ["cms", "todo-categories"],
  CACHE_OPTIONS
);

const getLandingPage = async (
  locale: Locale
): Promise<LandingPageContent | null> => {
  try {
    return await readLandingPage(locale);
  } catch (error) {
    console.error("[cms:payload] getLandingPage failed", error);
    return null;
  }
};

const getTodoCategories = async (locale: Locale): Promise<TodoCategory[]> => {
  try {
    return await readTodoCategories(locale);
  } catch (error) {
    console.error("[cms:payload] getTodoCategories failed", error);
    return [];
  }
};

export const payloadSource: ContentSource = {
  getLandingPage,
  getTodoCategories,
};
