import { incidentRepo } from "../../repositories/incidents/incidentsRepo.js";
import {
  IncidentUpdateSchema,
  type IncidentCreateInput,
  type IncidentQueryInput,
  type IncidentUpdateInput,
} from "../../schemas/incidents/incidentsSchema.js";

class IncidentService {
  async paginate(query: IncidentQueryInput) {
    const { rows, count } = await incidentRepo.findAll(query);
    return {
      items: rows,
      total: count,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async create(input: IncidentCreateInput & { reporterId?: number }) {
    return incidentRepo.create(input);
  }

  async getByIdOrThrow(id: number) {
    const found = await incidentRepo.findById(id);
    if (!found) {
      const err = new Error("Incidente no encontrado");
      (err as any).statusCode = 404;
      throw err;
    }
    return found;
  }

  async update(id: number, input: IncidentUpdateInput) {
    const data = IncidentUpdateSchema.parse(input);
    const i = await incidentRepo.findById(id);
    if (!i) {
      const err = new Error("Incidente no encontrado por id");
      (err as any).statusCode = 404;
      throw err;
    }
    const incidentToUpdate = {
      typeIncident: data.typeIncident ?? i.typeIncident,
      message: data.message ?? i.message,
      latitude: data.latitude ?? i.latitude,
      longitude: data.longitude ?? i.longitude,
      address: data.address ?? i.address,
      status: data.status ?? i.status,
    };
    const incidentUpdated = await incidentRepo.update(id, incidentToUpdate);
    return incidentUpdated;
  }

  async softDelete(id: number) {
    const ok = await incidentRepo.delete(id);
    if (!ok) {
      const err = new Error("Incidente no encontrado");
      (err as any).statusCode = 404;
      throw err;
    }
  }
}
export const incidentService = new IncidentService();
