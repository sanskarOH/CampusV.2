import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { rateLimitOrThrow } from "@/lib/rate-limit";
import { handleRouteError } from "./handle-route-error";

/**
 * Applies rate limiting and centralized error handling around API handlers.
 */
export async function runApi(
  req: NextRequest,
  fn: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    rateLimitOrThrow(req);
    return await fn();
  } catch (e) {
    return handleRouteError(e);
  }
}
