import "server-only";
import { payloadSource } from "./payload";
import type { ContentSource } from "./types";

// The one place that picks a CMS. Consumers import `content` and the types,
// never an adapter, so a future swap is a change to this line.
export const content: ContentSource = payloadSource;

export type { LandingPageContent, TodoCategory } from "./types";
