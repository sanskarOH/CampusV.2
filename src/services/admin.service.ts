import type { Prisma } from "@prisma/client";
import { Role, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/app-error";
import { toPublicUser } from "@/lib/user-public";

export async function listUsers(input: {
  page: number;
  limit: number;
  role?: Role;
  status?: UserStatus;
  search?: string;
}) {
  const skip = (input.page - 1) * input.limit;
  const where: Prisma.UserWhereInput = {};

  if (input.role) where.role = input.role;
  if (input.status) where.status = input.status;
  if (input.search?.trim()) {
    const s = input.search.trim();
    where.OR = [
      { name: { contains: s, mode: "insensitive" } },
      { email: { contains: s, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: input.limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items: users.map(toPublicUser),
    total,
    page: input.page,
    limit: input.limit,
  };
}

export async function updateUserAdmin(
  actorRole: Role,
  targetUserId: string,
  body: {
    status?: UserStatus;
    role?: Role;
    approveOrganizer?: boolean;
  }
) {
  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) {
    throw new AppError("User not found", 404);
  }
  if (target.role === "ADMIN" && actorRole !== "ADMIN") {
    throw new AppError("Forbidden", 403);
  }

  let data: Prisma.UserUpdateInput = {};

  if (body.approveOrganizer) {
    if (target.role !== "ORGANIZER") {
      throw new AppError("User is not an organizer", 400);
    }
    data = { status: "ACTIVE" };
  } else {
    if (body.status !== undefined) data.status = body.status;
    if (body.role !== undefined) {
      if (body.role === "ADMIN" && actorRole !== "ADMIN") {
        throw new AppError("Only admins can assign ADMIN role", 403);
      }
      data.role = body.role;
    }
  }

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data,
  });
  return toPublicUser(updated);
}
