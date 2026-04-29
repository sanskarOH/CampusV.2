import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/app-error";
import { createNotification } from "./notification.service";

export async function registerForEvent(userId: string, eventId: string) {
  return prisma.$transaction(
    async (tx) => {
      const event = await tx.event.findUnique({ where: { id: eventId } });
      if (!event) {
        throw new AppError("Event not found", 404);
      }
      if (event.date < new Date()) {
        throw new AppError("Cannot register for a past event", 400);
      }

      const existing = await tx.registration.findUnique({
        where: { userId_eventId: { userId, eventId } },
      });

      if (existing?.status === "REGISTERED") {
        return { registration: existing, idempotent: true as const };
      }

      const activeCount = await tx.registration.count({
        where: { eventId, status: "REGISTERED" },
      });

      if (existing?.status === "CANCELLED") {
        if (activeCount >= event.seats) {
          throw new AppError("Event is full", 409);
        }
        const updated = await tx.registration.update({
          where: { id: existing.id },
          data: { status: "REGISTERED" },
        });
        return { registration: updated, idempotent: false as const };
      }

      if (activeCount >= event.seats) {
        throw new AppError("Event is full", 409);
      }

      const created = await tx.registration.create({
        data: { userId, eventId, status: "REGISTERED" },
      });
      return { registration: created, idempotent: false as const };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000,
      timeout: 10_000,
    }
  );
}

export async function afterRegistrationNotify(
  userId: string,
  eventTitle: string,
  email?: string
) {
  await createNotification(
    userId,
    `You are registered for "${eventTitle}".`,
    { sendEmail: true, email }
  );
}

export async function cancelRegistration(userId: string, registrationId: string) {
  return prisma.$transaction(
    async (tx) => {
      const reg = await tx.registration.findFirst({
        where: { id: registrationId, userId },
        include: { event: true },
      });
      if (!reg) {
        throw new AppError("Registration not found", 404);
      }
      if (reg.status === "CANCELLED") {
        return { registration: reg, idempotent: true as const };
      }
      const updated = await tx.registration.update({
        where: { id: reg.id },
        data: { status: "CANCELLED" },
      });
      return { registration: updated, event: reg.event, idempotent: false as const };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000,
      timeout: 10_000,
    }
  );
}

export async function listUserRegistrations(userId: string) {
  return prisma.registration.findMany({
    where: { userId, status: "REGISTERED" },
    orderBy: { createdAt: "desc" },
    include: {
      event: {
        include: {
          organizer: { select: { id: true, name: true } },
        },
      },
    },
  });
}
