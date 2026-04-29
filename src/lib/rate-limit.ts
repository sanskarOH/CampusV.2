import type { NextRequest } from "next/server";
import { AppError } from "./app-error";
import { env } from "./env";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * In-memory sliding window rate limiter per IP.
 * For multi-instance production deployments, replace with Redis (e.g. Upstash).
 */
export function rateLimitOrThrow(req: NextRequest): void {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const key = ip;
  const now = Date.now();
  const windowMs = env.RATE_LIMIT_WINDOW_MS;
  const max = env.RATE_LIMIT_MAX;

  let b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    b = { count: 0, resetAt: now + windowMs };
    buckets.set(key, b);
  }
  b.count += 1;
  if (b.count > max) {
    throw new AppError("Too many requests", 429, "RATE_LIMIT");
  }
}
