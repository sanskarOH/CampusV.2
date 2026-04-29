export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { clearAuthCookie } from "@/server/auth-cookie";
import { jsonSuccess } from "@/lib/api-response";
import { runApi } from "@/server/run-api";

export async function POST(req: NextRequest) {
  return runApi(req, async () => {
    clearAuthCookie();
    return jsonSuccess({ ok: true });
  });
}
