import { NextResponse } from "next/server";

export type ApiSuccess<T = unknown> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: string;
};

export function jsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data } satisfies ApiSuccess<T>, {
    status,
  });
}

export function jsonError(message: string, status = 400): NextResponse {
  return NextResponse.json({ success: false, error: message } satisfies ApiFailure, {
    status,
  });
}
