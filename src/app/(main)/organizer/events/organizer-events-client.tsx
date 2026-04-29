"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Calendar, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiDelete, apiGet } from "@/lib/api";
import { formatEventDate } from "@/lib/format";
import type { EventListItem } from "@/lib/types";
import { RequireAuth } from "@/components/auth/require-auth";
import { useSession } from "@/components/providers/session-provider";

export function OrganizerEventsClient() {
  const { user } = useSession();
  const [items, setItems] = React.useState<EventListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<EventListItem | null>(null);

  const load = React.useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const acc: EventListItem[] = [];
    let page = 1;
    const limit = 50;
    let total = Infinity;
    while ((page - 1) * limit < total) {
      const res = await apiGet<{
        items: EventListItem[];
        total: number;
        limit: number;
      }>(`/api/events?page=${page}&limit=${limit}`);
      if (!res.success) {
        toast.error(res.error);
        break;
      }
      total = res.data.total;
      acc.push(
        ...res.data.items.filter((e) => e.organizer.id === user.id)
      );
      page += 1;
      if (page > 40) break;
    }
    setItems(acc);
    setLoading(false);
  }, [user?.id]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const targetId = pendingDelete.id;
    setDeleteId(targetId);
    const res = await apiDelete(`/api/events/${targetId}`);
    setDeleteId(null);
    setPendingDelete(null);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Event deleted");
    setItems((prev) => prev.filter((e) => e.id !== targetId));
  };

  return (
    <RequireAuth roles={["ORGANIZER", "ADMIN"]}>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My events</h1>
            <p className="text-muted-foreground">
              Create, edit, or remove events you organize.
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/organizer/events/new">
              <Plus className="h-4 w-4" />
              New event
            </Link>
          </Button>
        </div>
        {user?.role === "ORGANIZER" && user.status === "PENDING" && (
          <Card className="mb-6 border-amber-500/50 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="text-base">Approval pending</CardTitle>
              <CardDescription>
                Your organizer account is awaiting admin approval. You cannot create
                events until approved.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && items.length === 0 && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>No events yet</CardTitle>
              <CardDescription>
                When you create an event, it will show up here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/organizer/events/new">Create event</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        {!loading && items.length > 0 && (
          <div className="space-y-4">
            {items.map((e) => (
              <Card key={e.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-lg">{e.title}</CardTitle>
                      <Badge variant="secondary">{e.category}</Badge>
                    </div>
                    <CardDescription className="mt-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatEventDate(e.date)}
                    </CardDescription>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {e.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/organizer/events/${e.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive"
                      disabled={deleteId === e.id}
                      onClick={() => setPendingDelete(e)}
                    >
                      {deleteId === e.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Dialog open={!!pendingDelete} onOpenChange={() => setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete event?</DialogTitle>
            <DialogDescription>
              This cannot be undone. Registrations for this event will be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void confirmDelete()}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RequireAuth>
  );
}
