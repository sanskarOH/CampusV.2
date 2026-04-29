import { z } from "zod";
import { paginationSchema } from "./pagination.schema";

const roleEnum = z.enum(["STUDENT", "ORGANIZER", "ADMIN"]);
const userStatusEnum = z.enum(["ACTIVE", "PENDING", "SUSPENDED"]);

export const adminUsersQuerySchema = paginationSchema.extend({
  role: roleEnum.optional(),
  status: userStatusEnum.optional(),
  search: z.string().max(200).optional(),
});
//meow
export const adminUpdateUserBodySchema = z
  .object({
    status: userStatusEnum.optional(),
    role: roleEnum.optional(),
    approveOrganizer: z.boolean().optional(),
  })
  .refine(
    (b) =>
      b.status !== undefined ||
      b.role !== undefined ||
      b.approveOrganizer !== undefined,
    { message: "At least one field is required" },
  );

export const adminUserIdParamSchema = z.object({
  id: z.string().cuid(),
});
