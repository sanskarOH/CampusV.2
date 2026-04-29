"use client";

import * as React from "react";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiGet } from "@/lib/api";
import { formatEventDate } from "@/lib/format";
import type { EventListItem } from "@/lib/types";
import { RequireAuth } from "@/components/auth/require-auth";
import { useSession } from "@/components/providers/session-provider";

function downloadCsv(rows: EventListItem[]) {
  const header = "Title,Date (ISO),Category,Total Seats,Registered,Available\n";
  const body = rows
    .map((r) => {
      const title = `"${r.title.replace(/"/g, '""')}"`;
      return `${title},${r.date},${r.category},${r.seats},${r.seatsTaken},${r.seatsAvailable}`;
    })
    .join("\n");
  const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `events-registration-summary-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Export started");
}

export function RegistrationsManageClient() {
  const { user } = useSession();
  const [items, setItems] = React.useState<EventListItem[]>([]);
  const [loading, setLoading] = React.useState(true);

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

  return (
    <RequireAuth roles={["ORGANIZER", "ADMIN"]}>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Registrations</h1>
            <p className="text-muted-foreground">
              Summary of registration counts for your events. Individual attendee
              details are managed securely on the server; export includes aggregate
              stats for planning.
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            disabled={loading || items.length === 0}
            onClick={() => downloadCsv(items)}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Your events</CardTitle>
            <CardDescription>
              Live seat usage across programs you organize.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {!loading && items.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No events yet. Create one from the My events page.
              </p>
            )}
            {!loading && items.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>When</TableHead>
                    <TableHead className="text-right">Registered</TableHead>
                    <TableHead className="text-right">Capacity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatEventDate(e.date)}
                      </TableCell>
                      <TableCell className="text-right">{e.seatsTaken}</TableCell>
                      <TableCell className="text-right">{e.seats}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}
