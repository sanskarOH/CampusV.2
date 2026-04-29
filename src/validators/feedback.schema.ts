import { z } from "zod";

export const createFeedbackBodySchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(1).max(2000),
});
