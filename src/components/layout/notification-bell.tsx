"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiGet, apiPatch } from "@/lib/api";
import { formatRelative } from "@/lib/format";
import type { NotificationItem } from "@/lib/types";
import { useSession } from "@/components/providers/session-provider";

function linkForMessage(message: string): string {
  const m = /"([^"]+)"/.exec(message);
  if (m?.[1]) {
    return `/events?search=${encodeURIComponent(m[1])}`;
  }
  return "/events";
}

export function NotificationBell() {
  const { user } = useSession();
  const router = useRouter();
  const [items, setItems] = React.useState<NotificationItem[]>([]);
  const [open, setOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!user) return;
    const res = await apiGet<{
      items: NotificationItem[];
      total: number;
    }>("/api/notifications?page=1&limit=30");
    if (res.success) setItems(res.data.items);
  }, [user]);

  React.useEffect(() => {
    if (user && open) void load();
  }, [user, open, load]);

  React.useEffect(() => {
    if (user) void load();
  }, [user, load]);

  const unread = items.filter((n) => !n.read).length;

  const markRead = async (n: NotificationItem) => {
    const res = await apiPatch(`/api/notifications/${n.id}/read`, {});
    if (res.success) {
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
      );
      const href = linkForMessage(n.message);
      router.push(href);
      setOpen(false);
    } else {
      toast.error(res.error);
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuLabel className="px-3 py-2">Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[min(320px,50vh)]">
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No notifications yet.
            </p>
          ) : (
            items.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="cursor-pointer flex-col items-start gap-1 p-3"
                onClick={() => void markRead(n)}
              >
                <span className="text-sm leading-snug">{n.message}</span>
                <span className="text-xs text-muted-foreground">
                  {formatRelative(n.createdAt)}
                  {!n.read ? " · Unread" : ""}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="/events">Browse events</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
