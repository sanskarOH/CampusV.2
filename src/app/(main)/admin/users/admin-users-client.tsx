"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiGet, apiPatch } from "@/lib/api";
import type { Role, User, UserStatus } from "@/lib/types";
import { RequireAuth } from "@/components/auth/require-auth";

export function AdminUsersClient() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await apiGet<{ items: User[]; total: number }>(
      "/api/admin/users?page=1&limit=200"
    );
    if (res.success) setUsers(res.data.items);
    else toast.error(res.error);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const patch = async (id: string, body: Record<string, unknown>) => {
    setBusyId(id);
    const res = await apiPatch(`/api/admin/users/${id}`, body);
    setBusyId(null);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("User updated");
    void load();
  };

  return (
    <RequireAuth roles={["ADMIN"]}>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User management</h1>
            <p className="text-muted-foreground">
              Adjust roles, suspend accounts, and approve organizers.
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Directory</CardTitle>
            <CardDescription>All registered users in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {!loading && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Select
                          disabled={busyId === u.id || u.role === "ADMIN"}
                          value={u.role}
                          onValueChange={(role) =>
                            void patch(u.id, { role: role as Role })
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="STUDENT">Student</SelectItem>
                            <SelectItem value="ORGANIZER">Organizer</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            u.status === "ACTIVE"
                              ? "success"
                              : u.status === "SUSPENDED"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {u.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {u.role === "ORGANIZER" && u.status === "PENDING" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={busyId === u.id}
                            onClick={() => void patch(u.id, { approveOrganizer: true })}
                          >
                            {busyId === u.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Approve"
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant={
                            u.status === "SUSPENDED" ? "outline" : "destructive"
                          }
                          disabled={busyId === u.id || u.role === "ADMIN"}
                          onClick={() =>
                            void patch(u.id, {
                              status:
                                u.status === "SUSPENDED"
                                  ? ("ACTIVE" as UserStatus)
                                  : ("SUSPENDED" as UserStatus),
                            })
                          }
                        >
                          {u.status === "SUSPENDED" ? "Unsuspend" : "Suspend"}
                        </Button>
                      </TableCell>
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
