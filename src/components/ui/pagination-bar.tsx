"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildQuery } from "@/lib/api";

type Props = {
  page: number;
  totalPages: number;
  basePath: string;
  extraParams?: Record<string, string | undefined>;
};

export function PaginationBar({
  page,
  totalPages,
  basePath,
  extraParams = {},
}: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const go = (p: number) => {
    const q = buildQuery({
      ...Object.fromEntries(sp.entries()),
      ...extraParams,
      page: p,
    });
    router.push(`${basePath}${q}`);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 pt-8">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => go(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => go(page + 1)}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
