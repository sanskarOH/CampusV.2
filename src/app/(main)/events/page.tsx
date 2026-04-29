import { Suspense } from "react";
import { EventsList } from "./events-list";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <Skeleton className="h-10 w-64" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        </div>
      }
    >
      <EventsList />
    </Suspense>
  );
}
