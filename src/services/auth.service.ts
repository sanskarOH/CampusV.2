import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/app-error";
import { hashPassword, verifyPassword } from "@/lib/password";
import { signAccessToken } from "@/lib/jwt";
import { toPublicUser } from "@/lib/user-public";

function initialStatusForRole(role: Role) {
  if (role === "ORGANIZER") return "PENDING" as const;
  return "ACTIVE" as const;
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  role: "STUDENT" | "ORGANIZER";
}) {
  const exists = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });
  if (exists) {
    throw new AppError("Email already registered", 409);
  }
  const password = await hashPassword(input.password);
  const role = input.role as Role;

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      password,
      role,
      status: initialStatusForRole(role),
    },
  });
  return toPublicUser(user);
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }
  const ok = await verifyPassword(password, user.password);
  if (!ok) {
    throw new AppError("Invalid email or password", 401);
  }
  if (user.status === "SUSPENDED") {
    throw new AppError("Account suspended", 403);
  }
  const token = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  return { token, user: toPublicUser(user) };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return null;
  return toPublicUser(user);
}
