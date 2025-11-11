import type { Request, Response } from "express";
import { incidentMapService } from "../../services/map/mapService.js";

export async function listGeo(req: Request, res: Response) {
  const geojson = await incidentMapService.listForMap(req.query as any);
  res.json({ success: true, data: geojson });
}
