"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { buildQuery } from "@/lib/api";

export function EventSearchFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const [search, setSearch] = React.useState(sp.get("search") ?? "");
  const [category, setCategory] = React.useState(sp.get("category") ?? "");
  const [dateFrom, setDateFrom] = React.useState(
    sp.get("dateFrom")?.slice(0, 10) ?? ""
  );
  const [dateTo, setDateTo] = React.useState(sp.get("dateTo")?.slice(0, 10) ?? "");

  const apply = React.useCallback(() => {
    const q = buildQuery({
      page: 1,
      search: search || undefined,
      category: category || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
    router.push(`/events${q}`);
  }, [router, search, category, dateFrom, dateTo]);

  React.useEffect(() => {
    setSearch(sp.get("search") ?? "");
    setCategory(sp.get("category") ?? "");
    setDateFrom(sp.get("dateFrom")?.slice(0, 10) ?? "");
    setDateTo(sp.get("dateTo")?.slice(0, 10) ?? "");
  }, [sp]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && document.activeElement?.tagName === "INPUT") {
        apply();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [apply]);

  const filterFields = (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="search">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Name or category…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          placeholder="e.g. Career"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="df">From date</Label>
        <Input
          id="df"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dt">To date</Label>
        <Input
          id="dt"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-end">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="button" onClick={apply} className="shrink-0">
            Search
          </Button>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">{filterFields}</div>
            <Button className="mt-6 w-full" onClick={apply}>
              Apply filters
            </Button>
          </SheetContent>
        </Sheet>
      </div>
      <div className="hidden rounded-lg border bg-card p-4 lg:block">
        {filterFields}
        <div className="mt-4 flex justify-end">
          <Button type="button" variant="secondary" onClick={apply}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
