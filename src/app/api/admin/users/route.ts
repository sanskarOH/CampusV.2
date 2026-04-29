export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { adminUsersQuerySchema } from "@/validators/admin.schema";
import { listUsers } from "@/services/admin.service";
import { jsonSuccess } from "@/lib/api-response";
import { runApi } from "@/server/run-api";
import { requireRoles, requireSession } from "@/server/session";
import type { Role, UserStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  return runApi(req, async () => {
    const session = await requireSession();
    requireRoles(session, ["ADMIN"]);
    const { searchParams } = new URL(req.url);
    const raw = Object.fromEntries(searchParams.entries());
    const q = adminUsersQuerySchema.parse({
      page: raw.page,
      limit: raw.limit,
      role: raw.role,
      status: raw.status,
      search: raw.search,
    });
    const data = await listUsers({
      ...q,
      role: q.role as Role | undefined,
      status: q.status as UserStatus | undefined,
    });
    return jsonSuccess(data);
  });
}
