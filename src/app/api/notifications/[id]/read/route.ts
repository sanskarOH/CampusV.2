export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { notificationIdParamSchema } from "@/validators/notification.schema";
import { markNotificationRead } from "@/services/notification.service";
import { jsonSuccess } from "@/lib/api-response";
import { runApi } from "@/server/run-api";
import { requireSession } from "@/server/session";

type Ctx = { params: { id: string } };

export async function PATCH(req: NextRequest, context: Ctx) {
  return runApi(req, async () => {
    const session = await requireSession();
    const { id } = notificationIdParamSchema.parse(context.params);
    const notification = await markNotificationRead(session.id, id);
    return jsonSuccess({ notification });
  });
}
