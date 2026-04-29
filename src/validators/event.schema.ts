import { z } from "zod";
import { paginationSchema } from "./pagination.schema";

export const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(10_000),
  category: z.string().min(1).max(100),
  date: z.coerce.date(),
  seats: z.coerce.number().int().min(1).max(100_000),
});

export const updateEventSchema = createEventSchema.partial();

export const eventListQuerySchema = paginationSchema.extend({
  search: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export const eventIdParamSchema = z.object({
  id: z.string().cuid(),
});
