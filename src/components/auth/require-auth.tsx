"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "@/components/providers/session-provider";
import type { Role } from "@/lib/types";

type Props = {
  roles?: Role[];
  children: React.ReactNode;
};

export function RequireAuth({ roles, children }: Props) {
  const { user, loading } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (roles && !roles.includes(user.role)) {
      router.replace("/");
    }
  }, [user, loading, roles, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (roles && !roles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
