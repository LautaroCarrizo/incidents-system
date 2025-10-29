import { z } from "zod";
import { PaginationQueryZ } from "../pagination/pagination.js";
import { AgentStatusZ, AgentTypeZ } from "../../enums/enumsWithZod.js";

export const AgentCreateSchema = z.object({
  agentName: z.string().min(2).max(30),
  agentType: AgentTypeZ,
  userId: z.number().int().positive(),
  status: AgentStatusZ.default("OFFLINE"),
  capacity: z.number().int().min(1).max(50).default(3),
  activeAssignmentsCount: z.number().int().min(0).default(0),
  jurisdiction: z
    .string()
    .max(120)
    .optional()
    .nullable()
    .transform((v) => v ?? null),

  isOnCall: z.boolean().default(false),
  autoAccept: z.boolean().default(false),
  lastSeenAt: z
    .preprocess((v) => (v == null ? null : v), z.date().nullable())
    .default(null),
});

export type AgentCreateInput = z.infer<typeof AgentCreateSchema>;

export const AgentUpdateSchema = z
  .object({
    agentName: z.string().min(2).max(30),
    status: AgentStatusZ.optional(),
    agentType: AgentTypeZ,
    jurisdiction: z.string().max(120).optional().nullable(),
    capacity: z.number().int().min(1).max(50).optional(),
    autoAccept: z.boolean().optional(),
    isOnCall: z.boolean().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, {
    message: "Nada para actualizar",
  });
export type AgentUpdateInput = z.infer<typeof AgentUpdateSchema>;

export const AgentQuerySchema = PaginationQueryZ.extend({
  status: AgentStatusZ.optional(),
  jurisdiction: z.string().max(120).optional(),
  agentType: AgentTypeZ.optional(),
  search: z.string().min(1).max(200).optional(),
});
export type AgentQueryInput = z.infer<typeof AgentQuerySchema>;
