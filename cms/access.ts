import type { Access } from "payload";

// Any logged-in editor. Anonymous REST/GraphQL callers get 403; the app itself
// reads through the Local API, which doesn't consult access rules.
export const isEditor: Access = ({ req }) => Boolean(req.user);

// For operations the data model forbids outright, e.g. hard-deleting reference
// data that the app's database points at by key.
export const nobody: Access = () => false;
