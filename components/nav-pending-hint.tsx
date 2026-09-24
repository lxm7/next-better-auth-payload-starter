"use client";

import { cn } from "cn";
import { useLinkStatus } from "next/link";

/**
 * Loading sweep across the enclosing `<Link>` while its navigation is
 * pending. Must render inside a `Link` — `@/i18n/navigation`'s renders
 * `next/link` underneath, so `useLinkStatus` resolves against it — and that
 * `Link` needs `relative overflow-hidden` to contain the sweep.
 *
 * Always mounted and absolutely positioned, so toggling it never shifts
 * layout. The fade-in is delayed so navigations that finish quickly (a
 * prefetched route) never flash it; the fade-out is not.
 */
export function NavPendingHint() {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-current/15 to-transparent transition-opacity motion-reduce:hidden",
        pending ? "animate-shimmer opacity-100 delay-100" : "opacity-0"
      )}
    />
  );
}
