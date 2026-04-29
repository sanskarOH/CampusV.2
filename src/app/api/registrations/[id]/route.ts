export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { registrationIdParamSchema } from "@/validators/registration.schema";
import { cancelRegistration } from "@/services/registration.service";
import { jsonSuccess } from "@/lib/api-response";
import { runApi } from "@/server/run-api";
import { requireSession } from "@/server/session";
import { createNotification } from "@/services/notification.service";

type Ctx = { params: { id: string } };

export async function DELETE(req: NextRequest, context: Ctx) {
  return runApi(req, async () => {
    const session = await requireSession();
    const { id } = registrationIdParamSchema.parse(context.params);
    const result = await cancelRegistration(session.id, id);

    if (!result.idempotent && result.event) {
      await createNotification(
        session.id,
        `Your registration for "${result.event.title}" was cancelled.`
      );
    }

    return jsonSuccess({
      registration: result.registration,
      idempotent: result.idempotent,
    });
  });
}
