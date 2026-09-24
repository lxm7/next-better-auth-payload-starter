import { revalidateTag } from "next/cache";
import type {
  CollectionAfterChangeHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from "payload";

// The one tag every cached CMS read carries (see `lib/content/payload.ts`).
export const CMS_CACHE_TAG = "cms";

// Scripts outside Next (e.g. `cms/seed.ts`) pass this in `context`, because
// `revalidateTag` has no cache to talk to there and would throw.
export const DISABLE_REVALIDATE = "disableRevalidate";

const isPublished = (doc: unknown): boolean =>
  typeof doc === "object" &&
  doc !== null &&
  "_status" in doc &&
  doc._status === "published";

const revalidate = (req: PayloadRequest, source: string) => {
  if (req.context[DISABLE_REVALIDATE]) {
    return;
  }
  req.payload.logger.info(
    `[cms] ${source} changed; expiring "${CMS_CACHE_TAG}"`
  );
  // `{ expire: 0 }` rather than "max": the next request re-renders with the
  // new copy, so an editor sees their publish on the first reload instead of
  // one stale page later.
  revalidateTag(CMS_CACHE_TAG, { expire: 0 });
};

// For globals with drafts: a draft save changes nothing the site shows, so
// only a publish, or an edit to something already published (which covers
// unpublishing), expires the cache.
export const revalidateGlobalOnPublish: GlobalAfterChangeHook = ({
  doc,
  previousDoc,
  global,
  req,
}) => {
  if (isPublished(doc) || isPublished(previousDoc)) {
    revalidate(req, `global "${global.slug}"`);
  }
  return doc;
};

// For collections without drafts, where every save is live.
export const revalidateCollectionOnChange: CollectionAfterChangeHook = ({
  doc,
  collection,
  req,
}) => {
  revalidate(req, `collection "${collection.slug}"`);
  return doc;
};
