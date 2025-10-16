import { z } from "zod";
import { PaginationQueryZ } from "../pagination/pagination.js";
import { AgentStatusZ } from "../../enums/enumsWithZod.js";

export const AgentCreateSchema = z.object({
  userId: z.number().int().positive(),
  jurisdiction: z.string().max(120).optional().nullable().transform(v => v ?? null),
  capacity: z.number().int().min(1).max(50).optional(),
  autoAccept: z.boolean().optional(),
  isOnCall: z.boolean().optional(),
});
export type AgentCreateInput = z.infer<typeof AgentCreateSchema>;

export const AgentUpdateSchema = z.object({
  status: AgentStatusZ.optional(),
  jurisdiction: z.string().max(120).optional().nullable(),
  capacity: z.number().int().min(1).max(50).optional(),
  autoAccept: z.boolean().optional(),
  isOnCall: z.boolean().optional(),
}).refine(o => Object.keys(o).length > 0, { message: "Nada para actualizar" });
export type AgentUpdateInput = z.infer<typeof AgentUpdateSchema>;

export const AgentQuerySchema = PaginationQueryZ.extend({
  status: AgentStatusZ.optional(),
  jurisdiction: z.string().max(120).optional(),
});
export type AgentQueryInput = z.infer<typeof AgentQuerySchema>;
