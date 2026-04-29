import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/app-error";

export async function createFeedback(input: {
  userId: string;
  eventId: string;
  rating: number;
  comment: string;
}) {
  const event = await prisma.event.findUnique({ where: { id: input.eventId } });
  if (!event) {
    throw new AppError("Event not found", 404);
  }
  const now = new Date();
  if (event.date > now) {
    throw new AppError("Feedback is only allowed after the event has ended", 400);
  }

  const registration = await prisma.registration.findUnique({
    where: {
      userId_eventId: { userId: input.userId, eventId: input.eventId },
    },
  });
  if (!registration || registration.status !== "REGISTERED") {
    throw new AppError(
      "You must have attended (registered for) this event to leave feedback",
      403
    );
  }

  try {
    return await prisma.feedback.create({
      data: {
        userId: input.userId,
        eventId: input.eventId,
        rating: input.rating,
        comment: input.comment,
      },
    });
  } catch (e: unknown) {
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      throw new AppError("Feedback already submitted for this event", 409);
    }
    throw e;
  }
}

export async function listFeedbackForEvent(eventId: string) {
  return prisma.feedback.findMany({
    where: { eventId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true } },
    },
  });
}
