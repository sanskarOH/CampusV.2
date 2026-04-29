export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import {
  adminUpdateUserBodySchema,
  adminUserIdParamSchema,
} from "@/validators/admin.schema";
import { updateUserAdmin } from "@/services/admin.service";
import { jsonSuccess } from "@/lib/api-response";
import { runApi } from "@/server/run-api";
import { requireRoles, requireSession } from "@/server/session";
import type { Role, UserStatus } from "@prisma/client";

type Ctx = { params: { id: string } };

export async function PATCH(req: NextRequest, context: Ctx) {
  return runApi(req, async () => {
    const session = await requireSession();
    requireRoles(session, ["ADMIN"]);
    const { id } = adminUserIdParamSchema.parse(context.params);
    const body = adminUpdateUserBodySchema.parse(await req.json());
    const user = await updateUserAdmin(session.role, id, {
      status: body.status as UserStatus | undefined,
      role: body.role as Role | undefined,
      approveOrganizer: body.approveOrganizer,
    });
    return jsonSuccess({ user });
  });
}
