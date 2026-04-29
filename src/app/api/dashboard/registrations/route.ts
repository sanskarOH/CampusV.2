export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { listUserRegistrations } from "@/services/registration.service";
import { jsonSuccess } from "@/lib/api-response";
import { runApi } from "@/server/run-api";
import { requireSession } from "@/server/session";

export async function GET(req: NextRequest) {
  return runApi(req, async () => {
    const session = await requireSession();
    const registrations = await listUserRegistrations(session.id);
    return jsonSuccess({ registrations });
  });
}
