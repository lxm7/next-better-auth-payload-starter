import "server-only";
import { hygraphSource } from "./adapter";
import type { ContentSource } from "./types";

// The one place that picks a CMS. Consumers import `content` and the types,
// never an adapter, so swapping Hygraph for Payload is a change to this line.
export const content: ContentSource = hygraphSource;

export type { LandingPageContent, TodoCategory } from "./types";
