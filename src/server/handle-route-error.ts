import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/app-error";
import { logger } from "@/lib/logger";

export function handleRouteError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode }
    );
  }
  if (error instanceof ZodError) {
    const message = error.issues
      .map((e) => `${e.path.join(".") || "body"}: ${e.message}`)
      .join("; ");
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
  logger.error({ err: error }, "Unhandled route error");
  return NextResponse.json(
    { success: false, error: "Internal server error" },
    { status: 500 }
  );
}
