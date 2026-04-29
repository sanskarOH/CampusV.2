"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { EventSearchFilters } from "@/components/events/event-search-filters";
import { EventCard } from "@/components/events/event-card";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet, buildQuery } from "@/lib/api";
import type { EventListItem } from "@/lib/types";

export function EventsList() {
  const sp = useSearchParams();
  const page = Math.max(1, Number(sp.get("page") || 1));
  const search = sp.get("search") ?? undefined;
  const category = sp.get("category") ?? undefined;
  const dateFrom = sp.get("dateFrom") ?? undefined;
  const dateTo = sp.get("dateTo") ?? undefined;

  const [data, setData] = React.useState<{
    items: EventListItem[];
    total: number;
    limit: number;
  } | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const q = buildQuery({
      page,
      limit: 12,
      search,
      category,
      dateFrom,
      dateTo,
    });
    void (async () => {
      const res = await apiGet<{
        items: EventListItem[];
        total: number;
        page: number;
        limit: number;
      }>(`/api/events${q}`);
      if (cancelled) return;
      if (!res.success) {
        setErr(res.error);
        setData(null);
      } else {
        setErr(null);
        setData(res.data);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [page, search, category, dateFrom, dateTo]);

  const totalPages =
    data && data.limit > 0 ? Math.ceil(data.total / data.limit) : 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="text-muted-foreground">
          Search and filter campus events. Registration opens on each event page.
        </p>
      </div>
      <EventSearchFilters />
      {loading && (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      )}
      {!loading && err && (
        <p className="mt-10 text-center text-destructive">{err}</p>
      )}
      {!loading && !err && data && data.items.length === 0 && (
        <div className="mt-16 rounded-2xl border border-dashed bg-muted/40 py-20 text-center">
          <p className="text-lg font-medium">No events found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting search or filters.
          </p>
        </div>
      )}
      {!loading && !err && data && data.items.length > 0 && (
        <>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
          <PaginationBar
            page={page}
            totalPages={totalPages}
            basePath="/events"
            extraParams={{
              search: search ?? "",
              category: category ?? "",
              dateFrom: dateFrom ?? "",
              dateTo: dateTo ?? "",
            }}
          />
        </>
      )}
    </div>
  );
}
