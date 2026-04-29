export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { jsonSuccess } from "@/lib/api-response";
import { runApi } from "@/server/run-api";
import { requireSession } from "@/server/session";

export async function GET(req: NextRequest) {
  return runApi(req, async () => {
    const session = await requireSession();
    return jsonSuccess({
      user: {
        id: session.id,
        email: session.email,
        name: session.name,
        role: session.role,
        status: session.status,
      },
    });
  });
}
