import { z } from "zod";
import { IncidentStatusZ, IncidentTypeZ } from "../../enums/enumsWithZod.js";

export const IncidentMapQuerySchema = z.object({
  status: IncidentStatusZ.optional(),
  typeIncident: IncidentTypeZ.optional(),
  bbox: z.string().optional(), // "minLng,minLat,maxLng,maxLat" - validación manual en service
  limit: z.coerce.number().int().min(1).max(500).default(100),
});
export type IncidentMapQuery = z.infer<typeof IncidentMapQuerySchema>;
