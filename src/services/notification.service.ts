import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/app-error";
import { sendEmailMock } from "./email.service";

export async function createNotification(
  userId: string,
  message: string,
  options?: { sendEmail?: boolean; email?: string }
) {
  const n = await prisma.notification.create({
    data: { userId, message },
  });
  if (options?.sendEmail && options.email) {
    await sendEmailMock(
      options.email,
      "College Events — Notification",
      message
    );
  }
  return n;
}

export async function listNotifications(userId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);
  return { items, total, page, limit };
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const existing = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });
  if (!existing) {
    throw new AppError("Notification not found", 404);
  }
  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

export async function markAllRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}
