"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export function Logout() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    // Transition spans sign-out *and* the navigation, so the button stays busy
    // until `/` has rendered.
    startTransition(async () => {
      const { error } = await authClient.signOut();

      if (error) {
        toast.error(error.message ?? error.statusText);
        return;
      }

      // Locale-aware `useRouter`: the bare `next/navigation` one would push the
      // unprefixed `/`, where the middleware re-runs detection and can land a
      // French user on `/en`. Re-entering the transition after the `await`
      // keeps `isPending` tracking the navigation.
      startTransition(() => router.push("/"));
    });
  };

  return (
    <Button loading={isPending} onClick={handleLogout} variant="outline">
      Logout {!isPending && <LogOut className="size-4" />}
    </Button>
  );
}
