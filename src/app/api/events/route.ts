export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import {
  createEventSchema,
  eventListQuerySchema,
} from "@/validators/event.schema";
import { createEvent, listPublicEvents } from "@/services/event.service";
import { jsonSuccess } from "@/lib/api-response";
import { runApi } from "@/server/run-api";
import { requireSession, requireActiveOrganizer } from "@/server/session";

export async function GET(req: NextRequest) {
  return runApi(req, async () => {
    const { searchParams } = new URL(req.url);
    const raw = Object.fromEntries(searchParams.entries());
    const query = eventListQuerySchema.parse({
      page: raw.page,
      limit: raw.limit,
      search: raw.search,
      category: raw.category,
      dateFrom: raw.dateFrom,
      dateTo: raw.dateTo,
    });
    const data = await listPublicEvents(query);
    return jsonSuccess(data);
  });
}

export async function POST(req: NextRequest) {
  return runApi(req, async () => {
    const session = await requireSession();
    await requireActiveOrganizer(session);
    const body = createEventSchema.parse(await req.json());
    const event = await createEvent({
      organizerId: session.id,
      ...body,
    });
    return jsonSuccess({ event }, 201);
  });
}
