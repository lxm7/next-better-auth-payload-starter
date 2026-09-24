import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ROW_KEYS = ["a", "b", "c"];

// Mirrors `TodosPage` + `Todos` (card, create form, a few rows) so the swap to
// real content doesn't jump. Static and data-free, which is what lets Next
// prefetch it and show it the instant a link is clicked.
export default function TodosLoading() {
  return (
    <main
      aria-busy
      className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-6 p-4"
    >
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3.5 w-10" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-9 w-14 self-end" />

          <ul className="flex flex-col gap-2">
            {ROW_KEYS.map((key) => (
              <li key={key}>
                <Skeleton className="h-16 w-full" />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
