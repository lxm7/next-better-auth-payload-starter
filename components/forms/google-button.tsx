"use client";

import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPathname } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";

type Href = Parameters<typeof getPathname>[0]["href"];

interface GoogleButtonProps {
  callbackHref: Href;
  label: string;
  badge?: string | null;
  disabled?: boolean;
  onPendingChange?: (pending: boolean) => void;
}

export function GoogleButton({
  callbackHref,
  label,
  badge,
  disabled,
  onPendingChange,
}: GoogleButtonProps) {
  const locale = useLocale();
  const [isPending, setIsPending] = useState(false);

  const setPending = (pending: boolean) => {
    setIsPending(pending);
    onPendingChange?.(pending);
  };

  // Going Back from Google's consent screen restores this page from the
  // bfcache with its state frozen mid-redirect, so the button would spin
  // forever. `persisted` is only true for those restores.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setIsPending(false);
        onPendingChange?.(false);
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [onPendingChange]);

  const signInWithGoogle = async () => {
    setPending(true);

    // On success better-auth assigns `window.location` and the promise
    // resolves before the page unloads — so pending is only cleared on error.
    const { error } = await authClient.signIn
      .social({
        provider: "google",
        // better-auth redirects to this path verbatim after the OAuth round
        // trip, so it has to carry the locale prefix itself — it never passes
        // through the locale-aware router.
        callbackURL: getPathname({ href: callbackHref, locale }),
      })
      .catch((thrown: unknown) => {
        // Network-level failures throw instead of returning `error`; unstick
        // the button, then let it surface as before.
        setPending(false);
        throw thrown;
      });

    if (error) {
      toast.error(error.message ?? error.statusText);
      setPending(false);
    }
  };

  return (
    <Button
      className="relative w-full"
      disabled={disabled}
      loading={isPending}
      onClick={signInWithGoogle}
      type="button"
      variant="outline"
    >
      {!isPending && (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <title>Google</title>
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="currentColor"
          />
        </svg>
      )}
      {label}
      {badge && <Badge className="absolute right-2 text-[9px]">{badge}</Badge>}
    </Button>
  );
}
