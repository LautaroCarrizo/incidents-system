import { z } from "zod";
import { PaginationQueryZ } from "../pagination/pagination.js";

export const UserCreateSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8),
  isAdmin: z.boolean().default(false),
});
export type UserCreateInput = z.infer<typeof UserCreateSchema>;

export const UserUpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  isAdmin: z.boolean().default(false),
}).refine(o => Object.keys(o).length > 0, { message: "Nada para actualizar" });
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;

export const UserQuerySchema = PaginationQueryZ.extend({
  search: z.string().min(1).max(120).optional(), // name/email
  isAdmin: z.coerce.boolean().default(false),
});
export type UserQueryInput = z.infer<typeof UserQuerySchema>;
