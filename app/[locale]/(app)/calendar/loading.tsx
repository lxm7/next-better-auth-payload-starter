import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Mirrors `CalendarPage`: same card, and a grid block at the `h-[70vh]` that
// `CalendarGrid` and its own dynamic-import placeholder occupy. Static and
// data-free so Next can prefetch it.
export default function CalendarLoading() {
  return (
    <main
      aria-busy
      className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-6 p-4"
    >
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[70vh] w-full" />
        </CardContent>
      </Card>
    </main>
  );
}
