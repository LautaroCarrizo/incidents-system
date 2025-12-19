import { Op } from "sequelize";
import { IncidentModel } from "../../models/incidents/incidents.js";
import { type IncidentMapQuery } from "../../schemas/map/mapZod.js";

type Feature = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: {
    id: number;
    typeIncident: string;
    status: string;
    message: string;
    address: string | null;
    createdAt: Date;
  };
};

type FeatureCollection = {
  type: "FeatureCollection";
  features: Feature[];
};

class IncidentMapService {
  async listForMap(query: IncidentMapQuery): Promise<FeatureCollection> {
    const { status, typeIncident, bbox, limit } = query;

    const where: any = {};
    if (status) where.status = status;
    if (typeIncident) where.typeIncident = typeIncident;

    if (bbox) {
      const parts = bbox.split(",").map(Number);
      
      if (parts.length === 4 && parts.every(Number.isFinite)) {
        const [minLng, minLat, maxLng, maxLat] = parts as [number, number, number, number];
        
        const normalizedMinLng = Math.min(minLng, maxLng);
        const normalizedMaxLng = Math.max(minLng, maxLng);
        const normalizedMinLat = Math.min(minLat, maxLat);
        const normalizedMaxLat = Math.max(minLat, maxLat);
        
        where.latitude = { [Op.between]: [normalizedMinLat, normalizedMaxLat] };
        where.longitude = { [Op.between]: [normalizedMinLng, normalizedMaxLng] };
      }
    }
    const safeLimit = Math.min(Math.max(Number((query as any).limit ?? 100) || 100, 1), 500);
    const rows = await IncidentModel.findAll({
      where,
      limit: safeLimit,
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "typeIncident",
        "status",
        "message",
        "latitude",
        "longitude",
        "address",
        "createdAt",
      ],
    });

    const features: Feature[] = rows
      .filter((r) => r.latitude != null && r.longitude != null)
      .map((r) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [Number(r.longitude), Number(r.latitude)],
        },
        properties: {
          id: r.id,
          typeIncident: r.typeIncident,
          status: r.status,
          message: r.message,
          address: r.address,
          createdAt: r.createdAt!,
        },
      }));

    return { type: "FeatureCollection", features };
  }
}

export const incidentMapService = new IncidentMapService();
