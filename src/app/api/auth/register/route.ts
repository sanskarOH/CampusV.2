export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { registerBodySchema } from "@/validators/auth.schema";
import { registerUser } from "@/services/auth.service";
import { signAccessToken } from "@/lib/jwt";
import { setAuthCookie } from "@/server/auth-cookie";
import { jsonSuccess } from "@/lib/api-response";
import { runApi } from "@/server/run-api";

export async function POST(req: NextRequest) {
  return runApi(req, async () => {
    const body = registerBodySchema.parse(await req.json());
    const user = await registerUser(body);
    const token = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    setAuthCookie(token);
    return jsonSuccess({ user });
  });
}
