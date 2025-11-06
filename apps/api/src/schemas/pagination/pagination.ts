import { z } from "zod";

export const PaginationQueryZ = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.string().regex(/^[-+]?(\w+)$/).optional(),
});
export type PaginationQueryZ = z.infer<typeof PaginationQueryZ>;
