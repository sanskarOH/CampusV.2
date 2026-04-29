import { z } from "zod";

export const registerBodySchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  role: z.enum(["STUDENT", "ORGANIZER"]).optional().default("STUDENT"),
});

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
