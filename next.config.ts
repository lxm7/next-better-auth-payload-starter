import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

function resolveAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (
    process.env.VERCEL_ENV === "production" &&
    process.env.VERCEL_PROJECT_PRODUCTION_URL
  ) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_APP_URL: resolveAppUrl() },
  // Explicit, because `withPayload` otherwise replaces Next's header with its
  // own `X-Powered-By: Next.js, Payload` on every route.
  poweredByHeader: false,
};

// Resolves `./i18n/request.ts` by convention.
const withNextIntl = createNextIntlPlugin();

// Payload outermost: it spreads the config it's given, so next-intl's
// additions survive, and its headers/externals apply to the final config.
export default withPayload(withNextIntl(nextConfig));
