import { incidentRepo } from "../../repositories/incidents/incidentsRepo.js";
import type { IncidentCreateInput, IncidentQueryInput, IncidentUpdateInput } from "../../schemas/incidents/incidentsSchema.js";

 class IncidentService {
  async paginate(query: IncidentQueryInput) {
    const { rows, count } = await incidentRepo.findAll(query);
    return { items: rows, total: count, page: query.page, pageSize: query.pageSize };
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
    const updated = await incidentRepo.update(id, input);
    if (!updated) {
      const err = new Error("Incidente no encontrado");
      (err as any).statusCode = 404;
      throw err;
    }
    return updated;
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
export const incidentService = new IncidentService()