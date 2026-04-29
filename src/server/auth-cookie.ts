import { cookies } from "next/headers";
import { env } from "@/lib/env";

const MAX_AGE_SEC = 60 * 60 * 24 * 7;

export function setAuthCookie(token: string) {
  const store = cookies();
  store.set(env.AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export function clearAuthCookie() {
  const store = cookies();
  store.set(env.AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function getTokenFromCookies(): string | undefined {
  return cookies().get(env.AUTH_COOKIE_NAME)?.value;
}
