import { z } from "zod";
import { IncidentStatusZ, IncidentTypeZ } from "../../enums/enumsWithZod.js";

export const IncidentMapQuerySchema = z.object({
  status: IncidentStatusZ.optional(),
  typeIncident: IncidentTypeZ.optional(),
  bbox: z
    .string()
    .regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?,\-?\d+(\.\d+)?,\-?\d+(\.\d+)?$/)
    .optional(), // "minLng,minLat,maxLng,maxLat"
  limit: z.coerce.number().int().min(1).max(500).default(100),
});
export type IncidentMapQuery = z.infer<typeof IncidentMapQuerySchema>;
