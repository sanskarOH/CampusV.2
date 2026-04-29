export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { createRegistrationBodySchema } from "@/validators/registration.schema";
import {
  afterRegistrationNotify,
  registerForEvent,
} from "@/services/registration.service";
import { jsonSuccess } from "@/lib/api-response";
import { runApi } from "@/server/run-api";
import { requireSession } from "@/server/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  return runApi(req, async () => {
    const session = await requireSession();
    const body = createRegistrationBodySchema.parse(await req.json());
    const result = await registerForEvent(session.id, body.eventId);

    if (!result.idempotent) {
      const event = await prisma.event.findUnique({
        where: { id: body.eventId },
        select: { title: true },
      });
      const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: { email: true },
      });
      if (event) {
        await afterRegistrationNotify(session.id, event.title, user?.email);
      }
    }

    const status = result.idempotent ? 200 : 201;
    return jsonSuccess(
      {
        registration: result.registration,
        idempotent: result.idempotent,
      },
      status
    );
  });
}
