import "server-only";
import { z } from "zod";
import type { Locale } from "@/i18n/routing";
import type { ContentSource, LandingPageContent, TodoCategory } from "./types";

// Hygraph's wire shapes. Parsing at the boundary means everything past this
// file only ever sees `LandingPageContent` and `TodoCategory`.

const graphqlEnvelopeSchema = z.object({
  data: z.unknown().optional(),
  errors: z.array(z.object({ message: z.string() })).optional(),
});

const landingPageResponseSchema = z.object({
  // Null when no entry matches the slug in the requested locale and stage.
  landingPage: z
    .object({
      heading: z.string(),
      subheading: z.string().nullable(),
      ctaPrimaryLabel: z.string().nullable(),
      ctaSecondaryLabel: z.string().nullable(),
    })
    .nullable(),
});

const todoCategoriesResponseSchema = z.object({
  todoCategories: z.array(
    z.object({
      key: z.string(),
      name: z.string(),
      // Hygraph's Color field is an object; the app only wants the hex.
      color: z.object({ hex: z.string() }).nullable(),
    })
  ),
});

type QueryResult<T> =
  | { kind: "ok"; data: T }
  | { kind: "failed"; reason: string; detail?: unknown };

const query = async <T>(
  document: string,
  variables: Record<string, unknown>,
  schema: z.ZodType<T>
): Promise<QueryResult<T>> => {
  const endpoint = process.env.HYGRAPH_ENDPOINT;
  const token = process.env.HYGRAPH_TOKEN;

  if (!(endpoint && token)) {
    return {
      kind: "failed",
      reason: "HYGRAPH_ENDPOINT or HYGRAPH_TOKEN is not set",
    };
  }

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: document, variables }),
      next: { tags: ["cms"], revalidate: 300 },
    });
  } catch (error) {
    return { kind: "failed", reason: "network error", detail: error };
  }

  if (!res.ok) {
    return { kind: "failed", reason: `HTTP ${res.status}` };
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch (error) {
    return { kind: "failed", reason: "response is not JSON", detail: error };
  }

  const envelope = graphqlEnvelopeSchema.safeParse(body);
  if (!envelope.success) {
    return {
      kind: "failed",
      reason: "response is not a GraphQL envelope",
      detail: z.prettifyError(envelope.error),
    };
  }

  // GraphQL reports errors with a 200, so `res.ok` alone doesn't catch them.
  if (envelope.data.errors?.length) {
    return {
      kind: "failed",
      reason: "GraphQL errors",
      detail: envelope.data.errors.map((error) => error.message),
    };
  }

  const parsed = schema.safeParse(envelope.data.data);
  if (!parsed.success) {
    return {
      kind: "failed",
      reason: "unexpected response shape",
      detail: z.prettifyError(parsed.error),
    };
  }

  return { kind: "ok", data: parsed.data };
};

const logFailure = (
  operation: string,
  result: Extract<QueryResult<unknown>, { kind: "failed" }>
) => {
  console.error(`[cms:hygraph] ${operation} failed: ${result.reason}`, {
    detail: result.detail,
  });
};

const getLandingPage = async (
  locale: Locale
): Promise<LandingPageContent | null> => {
  const result = await query(
    `query LandingPage($locale: Locale!) {
      landingPage(where: { slug: "home" }, stage: PUBLISHED, locales: [$locale]) {
        heading
        subheading
        ctaPrimaryLabel
        ctaSecondaryLabel
      }
    }`,
    { locale },
    landingPageResponseSchema
  );

  switch (result.kind) {
    case "failed":
      logFailure("getLandingPage", result);
      return null;
    case "ok":
      if (!result.data.landingPage) {
        // A content problem (unpublished, or no `locale` translation), not an
        // outage, so it warns rather than errors.
        console.warn(
          `[cms:hygraph] getLandingPage: no published "home" entry for locale "${locale}"`
        );
      }
      return result.data.landingPage;
    default: {
      const exhaustive: never = result;
      return exhaustive;
    }
  }
};

const getTodoCategories = async (locale: Locale): Promise<TodoCategory[]> => {
  const result = await query(
    `query TodoCategories($locale: Locale!) {
      todoCategories(stage: PUBLISHED, locales: [$locale], first: 100) {
        key
        name
        color { hex }
      }
    }`,
    { locale },
    todoCategoriesResponseSchema
  );

  switch (result.kind) {
    case "failed":
      logFailure("getTodoCategories", result);
      return [];
    case "ok":
      return result.data.todoCategories.map((category) => ({
        key: category.key,
        name: category.name,
        color: category.color?.hex ?? null,
      }));
    default: {
      const exhaustive: never = result;
      return exhaustive;
    }
  }
};

export const hygraphSource: ContentSource = {
  getLandingPage,
  getTodoCategories,
};
