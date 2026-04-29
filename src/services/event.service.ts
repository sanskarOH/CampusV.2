import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/app-error";

export async function createEvent(input: {
  organizerId: string;
  title: string;
  description: string;
  category: string;
  date: Date;
  seats: number;
}) {
  return prisma.event.create({
    data: {
      title: input.title,
      description: input.description,
      category: input.category,
      date: input.date,
      seats: input.seats,
      organizerId: input.organizerId,
    },
  });
}

export async function updateEvent(
  eventId: string,
  organizerId: string,
  data: Partial<{
    title: string;
    description: string;
    category: string;
    date: Date;
    seats: number;
  }>
) {
  const existing = await prisma.event.findUnique({ where: { id: eventId } });
  if (!existing) {
    throw new AppError("Event not found", 404);
  }
  if (existing.organizerId !== organizerId) {
    throw new AppError("Forbidden", 403);
  }
  return prisma.event.update({
    where: { id: eventId },
    data,
  });
}

export async function deleteEvent(eventId: string, organizerId: string) {
  const existing = await prisma.event.findUnique({ where: { id: eventId } });
  if (!existing) {
    throw new AppError("Event not found", 404);
  }
  if (existing.organizerId !== organizerId) {
    throw new AppError("Forbidden", 403);
  }
  await prisma.event.delete({ where: { id: eventId } });
}

export async function getEventById(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: {
      organizer: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

export async function getPublicEventDetail(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organizer: {
        select: { id: true, name: true },
      },
    },
  });
  if (!event) return null;

  const seatsTaken = await prisma.registration.count({
    where: { eventId: id, status: "REGISTERED" },
  });

  return {
    ...event,
    seatsTaken,
    seatsAvailable: Math.max(0, event.seats - seatsTaken),
  };
}

export async function listPublicEvents(input: {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  const skip = (input.page - 1) * input.limit;
  const where: Prisma.EventWhereInput = {};

  const and: Prisma.EventWhereInput[] = [];

  if (input.search?.trim()) {
    const s = input.search.trim();
    and.push({
      OR: [
        { title: { contains: s, mode: "insensitive" } },
        { category: { contains: s, mode: "insensitive" } },
      ],
    });
  }
  if (input.category?.trim()) {
    and.push({
      category: { equals: input.category.trim(), mode: "insensitive" },
    });
  }
  if (input.dateFrom) {
    and.push({ date: { gte: input.dateFrom } });
  }
  if (input.dateTo) {
    and.push({ date: { lte: input.dateTo } });
  }

  if (and.length) {
    where.AND = and;
  }

  const [rows, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { date: "asc" },
      skip,
      take: input.limit,
      include: {
        organizer: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.event.count({ where }),
  ]);

  const ids = rows.map((e) => e.id);
  const regCounts =
    ids.length === 0
      ? []
      : await prisma.registration.groupBy({
          by: ["eventId"],
          where: { eventId: { in: ids }, status: "REGISTERED" },
          _count: { _all: true },
        });
  const takenMap = new Map(
    regCounts.map((r) => [r.eventId, r._count._all])
  );

  const items = rows.map((e) => {
    const seatsTaken = takenMap.get(e.id) ?? 0;
    return {
      ...e,
      seatsTaken,
      seatsAvailable: Math.max(0, e.seats - seatsTaken),
    };
  });

  return { items, total, page: input.page, limit: input.limit };
}
