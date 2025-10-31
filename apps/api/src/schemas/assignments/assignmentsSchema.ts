import { z } from "zod";
import { PaginationQueryZ } from "../pagination/pagination.js";
import { AssignmentStatusZ } from "../../enums/enumsWithZod.js";

export const AssignmentCreateSchema = z.object({
  incidentId: z.number().int().positive(),
  agentId: z.number().int().positive(),
  status: AssignmentStatusZ.optional(), // default "ASSIGNED"
  slaDueAt: z.string().datetime().optional().nullable().transform(v => v ?? null),
  notes: z.string().max(500).optional().nullable().transform(v => v ?? null),
});
export type AssignmentCreateInput = z.infer<typeof AssignmentCreateSchema>;

export const AssignmentUpdateSchema = z.object({
  incidentId: z.number().int().positive(),
  agentId: z.number().int().positive(),
  status: z.enum(["ACCEPTED","REJECTED","IN_PROGRESS","ON_HOLD","RESOLVED","CLOSED"]).optional(),
  slaDueAt: z.string().datetime().optional().nullable()
    .transform(v => (v ? new Date(v) : null)),
  acceptedAt: z.string().datetime().optional().nullable()
    .transform(v => (v ? new Date(v) : null)),
  startedAt: z.string().datetime().optional().nullable()
    .transform(v => (v ? new Date(v) : null)),
  resolvedAt: z.string().datetime().optional().nullable()
    .transform(v => (v ? new Date(v) : null)),
  closedAt: z.string().datetime().optional().nullable()
    .transform(v => (v ? new Date(v) : null)),
  notes: z.string().max(500).optional().nullable()
    .transform(v => v ?? null),
}).refine(o => Object.keys(o).length > 0, { message: "Nada para actualizar" });

export type AssignmentUpdateInput = z.infer<typeof AssignmentUpdateSchema>;
export const AssignmentQuerySchema = PaginationQueryZ.extend({
  status: AssignmentStatusZ.optional(),
  agentId: z.coerce.number().int().positive().optional(),
  incidentId: z.coerce.number().int().positive().optional(),
  search: z.string().min(1).max(200).optional(),
});
export type AssignmentQueryInput = z.infer<typeof AssignmentQuerySchema>;
