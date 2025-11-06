import { z } from "zod";
import { PaginationQueryZ } from "../pagination/pagination.js";
import { IncidentStatusZ, IncidentTypeZ } from "../../enums/enumsWithZod.js";

const LatZ = z.number().gte(-90).lte(90);
const LngZ = z.number().gte(-180).lte(180);

export const IncidentCreateSchema = z.object({
  typeIncident: IncidentTypeZ,
  message: z.string().min(5).max(500),
  latitude: z.number().optional().nullable()
    .refine(v => v === null || (typeof v === "number" && v >= -90 && v <= 90), "Latitud inválida")
    .transform(v => v ?? null),
  longitude: z.number().optional().nullable()
    .refine(v => v === null || (typeof v === "number" && v >= -180 && v <= 180), "Longitud inválida")
    .transform(v => v ?? null),
  address: z.string().max(255).optional().nullable().transform(v => v ?? null),
  reporterId: z.number().int().positive().optional().nullable()
}).strip();
export type IncidentCreateInput = z.infer<typeof IncidentCreateSchema>;

export const IncidentUpdateSchema = z.object({
  typeIncident: IncidentTypeZ.optional(),
  message: z.string().min(5).max(500).optional(),
  latitude: LatZ.nullable().optional(),
  longitude: LngZ.nullable().optional(),
  address: z.string().max(255).nullable().optional(),
  status: IncidentStatusZ.optional(), // reglas en el servicio
}).refine(o => Object.keys(o).length > 0, { message: "Nada para actualizar" });
export type IncidentUpdateInput = z.infer<typeof IncidentUpdateSchema>;

export const IncidentQuerySchema = PaginationQueryZ.extend({
  status: IncidentStatusZ.optional(),
  typeIncident: IncidentTypeZ.optional(),
  search: z.string().min(1).max(200).optional(),
});
export type IncidentQueryInput = z.infer<typeof IncidentQuerySchema>;
