"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Calendar, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiDelete, apiGet } from "@/lib/api";
import { formatEventDate } from "@/lib/format";
import type { RegistrationRow } from "@/lib/types";
import { RequireAuth } from "@/components/auth/require-auth";
import { useSession } from "@/components/providers/session-provider";

export function DashboardClient() {
  const { refresh } = useSession();
  const [rows, setRows] = React.useState<RegistrationRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [cancelId, setCancelId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await apiGet<{ registrations: RegistrationRow[] }>(
      "/api/dashboard/registrations"
    );
    if (res.success) setRows(res.data.registrations);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const cancel = async (id: string) => {
    setCancelId(id);
    const res = await apiDelete(`/api/registrations/${id}`);
    setCancelId(null);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Registration cancelled");
    setRows((prev) => prev.filter((r) => r.id !== id));
    await refresh();
  };

  return (
    <RequireAuth>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My dashboard</h1>
          <p className="text-muted-foreground">
            Events you are registered for. Cancel anytime before the event starts.
          </p>
        </div>
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && rows.length === 0 && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>No registrations yet</CardTitle>
              <CardDescription>
                Explore upcoming events and secure your seat in one click.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/events">Browse events</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        {!loading && rows.length > 0 && (
          <div className="space-y-4">
            {rows.map((r) => (
              <Card key={r.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-lg">
                        <Link
                          href={`/events/${r.event.id}`}
                          className="hover:text-primary"
                        >
                          {r.event.title}
                        </Link>
                      </CardTitle>
                      <Badge variant="secondary">{r.event.category}</Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatEventDate(r.event.date)}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={cancelId === r.id}
                    onClick={() => void cancel(r.id)}
                  >
                    {cancelId === r.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Cancel
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
