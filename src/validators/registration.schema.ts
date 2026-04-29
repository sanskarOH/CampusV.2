import { z } from "zod";

export const createRegistrationBodySchema = z.object({
  eventId: z.string().cuid(),
});

export const registrationIdParamSchema = z.object({
  id: z.string().cuid(),
});
