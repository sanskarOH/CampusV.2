export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { eventIdParamSchema, updateEventSchema } from "@/validators/event.schema";
import {
  deleteEvent,
  getPublicEventDetail,
  updateEvent,
} from "@/services/event.service";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { runApi } from "@/server/run-api";
import { requireSession, requireActiveOrganizer } from "@/server/session";

type Ctx = { params: { id: string } };

export async function GET(req: NextRequest, context: Ctx) {
  return runApi(req, async () => {
    const { id } = eventIdParamSchema.parse(context.params);
    const event = await getPublicEventDetail(id);
    if (!event) {
      return jsonError("Event not found", 404);
    }
    return jsonSuccess({ event });
  });
}

export async function PATCH(req: NextRequest, context: Ctx) {
  return runApi(req, async () => {
    const session = await requireSession();
    await requireActiveOrganizer(session);
    const { id } = eventIdParamSchema.parse(context.params);
    const body = updateEventSchema.parse(await req.json());
    const event = await updateEvent(id, session.id, body);
    return jsonSuccess({ event });
  });
}

export async function DELETE(req: NextRequest, context: Ctx) {
  return runApi(req, async () => {
    const session = await requireSession();
    await requireActiveOrganizer(session);
    const { id } = eventIdParamSchema.parse(context.params);
    await deleteEvent(id, session.id);
    return jsonSuccess({ ok: true });
  });
}
