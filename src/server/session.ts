import type { Role, User, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/jwt";
import { AppError } from "@/lib/app-error";
import { getTokenFromCookies } from "./auth-cookie";

export type SessionUser = {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  name: string;
};

export async function getSessionFromRequest(): Promise<SessionUser | null> {
  const token = getTokenFromCookies();
  if (!token) return null;
  let payload: { sub: string; email: string; role: Role };
  try {
    payload = verifyAccessToken(token);
  } catch {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
  });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    name: user.name,
  };
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSessionFromRequest();
  if (!session) {
    throw new AppError("Unauthorized", 401);
  }
  if (session.status === "SUSPENDED") {
    throw new AppError("Account suspended", 403);
  }
  return session;
}

export function requireRoles(session: SessionUser, allowed: Role[]): void {
  if (!allowed.includes(session.role)) {
    throw new AppError("Forbidden", 403);
  }
}

export async function requireActiveOrganizer(session: SessionUser): Promise<void> {
  requireRoles(session, ["ORGANIZER", "ADMIN"]);
  if (session.role === "ORGANIZER" && session.status !== "ACTIVE") {
    throw new AppError("Organizer account is not approved yet", 403);
  }
}

export async function loadUser(userId: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id: userId } });
}
