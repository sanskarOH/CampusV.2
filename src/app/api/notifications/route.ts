export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { paginationSchema } from "@/validators/pagination.schema";
import { listNotifications } from "@/services/notification.service";
import { jsonSuccess } from "@/lib/api-response";
import { runApi } from "@/server/run-api";
import { requireSession } from "@/server/session";

export async function GET(req: NextRequest) {
  return runApi(req, async () => {
    const session = await requireSession();
    const { searchParams } = new URL(req.url);
    const raw = Object.fromEntries(searchParams.entries());
    const q = paginationSchema.parse({ page: raw.page, limit: raw.limit });
    const data = await listNotifications(session.id, q.page, q.limit);
    return jsonSuccess(data);
  });
}
