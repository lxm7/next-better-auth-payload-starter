// Types next-intl against this app's own config rather than its `string` /
// `Record<string, any>` fallbacks. `en.json` is the source of truth: a key
// used in code but missing there fails `tsc` instead of surfacing at runtime
// as MISSING_MESSAGE. Other locales are not checked against it — keep them in
// parity by hand.
import type { Locale as AppLocale } from "@/i18n/routing";
import type messages from "@/messages/en.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: AppLocale;
    Messages: typeof messages;
  }
}
