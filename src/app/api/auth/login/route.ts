export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { loginBodySchema } from "@/validators/auth.schema";
import { loginUser } from "@/services/auth.service";
import { setAuthCookie } from "@/server/auth-cookie";
import { jsonSuccess } from "@/lib/api-response";
import { runApi } from "@/server/run-api";

export async function POST(req: NextRequest) {
  return runApi(req, async () => {
    const body = loginBodySchema.parse(await req.json());
    const { token, user } = await loginUser(body.email, body.password);
    setAuthCookie(token);
    return jsonSuccess({ user });
  });
}
