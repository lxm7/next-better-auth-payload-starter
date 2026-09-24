import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Logout } from "./logout";
import { ModeSwitcher } from "./mode-switcher";
import { NavPendingHint } from "./nav-pending-hint";

// import { OrganizationSwitcher } from "./organization-switcher";

// `relative overflow-hidden` gives `NavPendingHint`'s absolute sweep a
// containing block and clips it to the button's rounded box.
const navLinkClassName = buttonVariants({
  variant: "ghost",
  size: "sm",
  className: "relative overflow-hidden",
});

// Synchronous on purpose. It renders in the shared `(app)` layout, so any
// `await` here would hold up every navigation into that group before the
// route's `loading.tsx` could show.
export function Header() {
  return (
    <header className="absolute top-0 right-0 flex w-full items-center justify-between p-4">
      <div className="flex items-center gap-2">
        {/* Re-enabling this means fetching `getOrganizations()` from
            `@/server/organizations` again. Do it in an async child wrapped in
            `<Suspense>`, not in `Header` itself, for the reason above.

            <OrganizationSwitcher organizations={organizations} /> */}

        {/* `Link` from `@/i18n/navigation`, not `next/link`: the bare one
            drops the locale prefix and sends a French visitor to `/todos`,
            which 404s under `localePrefix: "always"`.

            No active-state highlight, because reading the current pathname
            needs `usePathname`, and that would turn this server component
            into a client one for the sake of a border. */}
        <nav className="flex items-center gap-1">
          <Link className={navLinkClassName} href="/todos">
            Todos
            <NavPendingHint />
          </Link>
          <Link className={navLinkClassName} href="/calendar">
            Calendar
            <NavPendingHint />
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <Logout />
        <ModeSwitcher />
      </div>
    </header>
  );
}
