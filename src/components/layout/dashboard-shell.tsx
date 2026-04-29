"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/components/providers/session-provider";
import type { Role } from "@/lib/types";

type NavItem = { href: string; label: string; icon: React.ElementType; roles: Role[] };

const items: NavItem[] = [
  {
    href: "/dashboard",
    label: "My dashboard",
    icon: LayoutDashboard,
    roles: ["STUDENT", "ORGANIZER", "ADMIN"],
  },
  {
    href: "/organizer/events",
    label: "My events",
    icon: CalendarDays,
    roles: ["ORGANIZER", "ADMIN"],
  },
  {
    href: "/organizer/registrations",
    label: "Manage registrations",
    icon: ClipboardList,
    roles: ["ORGANIZER", "ADMIN"],
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Shield,
    roles: ["ADMIN"],
  },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useSession();

  const show =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/organizer") ||
    pathname.startsWith("/admin");

  if (!show || !user) {
    return <>{children}</>;
  }

  const links = items.filter((i) => i.roles.includes(user.role));

  return (
    <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 pb-12 pt-6 sm:px-6">
      <aside className="hidden w-56 shrink-0 lg:block">
        <nav className="sticky top-24 space-y-1 rounded-xl border bg-card p-3 shadow-sm">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace
          </p>
          {links.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
