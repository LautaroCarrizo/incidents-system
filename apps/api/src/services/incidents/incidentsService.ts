import { incidentRepo } from "../../repositories/incidents/incidentsRepo.js";
import {
  IncidentUpdateSchema,
  IncidentCreateSchema,
  type IncidentCreateInput,
  type IncidentQueryInput,
  type IncidentUpdateInput,
} from "../../schemas/incidents/incidentsSchema.js";
import {
  toIncidentInfoDto,
  toIncidentListDto,
} from "../../dtos/incident/incidentDto.js";
import { sequelize } from "../../config/db/sequelizeConn.js";
type Ctx = { userId?: number; role?: "ADMIN" | "USER" };
class IncidentService {
  async paginate(query: IncidentQueryInput) {
    const { rows, count } = await incidentRepo.findAll(query);
    return {
      items: toIncidentListDto(rows),
      total: count,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async create(input: unknown, reporterIdFromAuth?: number) {
    const data = IncidentCreateSchema.parse(input);

    const reporterId = reporterIdFromAuth ?? data.reporterId ?? null;
    if (reporterId == null) {
      const err = new Error(
        "Debe especificarse un reporterId o estar autenticado"
      );
      (err as any).statusCode = 403;
      throw err;
    }

    const dto: IncidentCreateInput & { reporterId: number } = {
      ...data,
      reporterId,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      address: data.address ?? null,
    };

    const created = await sequelize.transaction(async (tx) => {
      return incidentRepo.create(dto, tx);
    });

    return toIncidentInfoDto(created);
  }
  async getByIdOrThrow(id: number) {
    const found = await incidentRepo.findById(id);
    if (!found) {
      const err = new Error("Incidente no encontrado");
      (err as any).statusCode = 404;
      throw err;
    }
    return toIncidentInfoDto(found);
  }

  async update(id: number, input: IncidentUpdateInput, ctx?: Ctx) {
    const data = IncidentUpdateSchema.parse(input);

    const updated = await sequelize.transaction(async (tx) => {
      const current = await incidentRepo.findById(id, tx);
      if (!current) {
        const err = new Error("Incidente no encontrado por id");
        (err as any).statusCode = 404;
        throw err;
      }

      const isOwner =
        current.reporterId != null && ctx?.userId === current.reporterId;
      const isAdmin = ctx?.role === "ADMIN";
      if (!isOwner && !isAdmin) {
        const err = new Error("No podés editar este incidente");
        (err as any).statusCode = 403;
        throw err;
      }

      const patchOwner = {
        message: data.message ?? current.message,
        latitude: data.latitude ?? current.latitude,
        longitude: data.longitude ?? current.longitude,
        address: data.address ?? current.address,
      };
      const patchAdmin = {
        ...patchOwner,
        typeIncident: data.typeIncident ?? current.typeIncident,
        status: data.status ?? current.status,
      };
      const patch = isAdmin ? patchAdmin : patchOwner;
      const saved = await incidentRepo.update(id, patch, tx);
      if (!saved) {
        const err = new Error("Incidente no encontrado al actualizar");
        (err as any).statusCode = 404;
        throw err;
      }

      return saved;
    });

    return toIncidentInfoDto(updated);
  }

  async softDelete(id: number, ctx?: Ctx) {
    const ok = await sequelize.transaction(async (tx) => {
      const current = await incidentRepo.findById(id, tx);
      if (!current) {
        const err = new Error("Incidente no encontrado");
        (err as any).statusCode = 404;
        throw err;
      }

      const isOwner =
        current.reporterId != null && ctx?.userId === current.reporterId;
      const isAdmin = ctx?.role === "ADMIN";
      if (!isOwner && !isAdmin) {
        const err = new Error("No podés eliminar este incidente");
        (err as any).statusCode = 403;
        throw err;
      }

      const deleted = await incidentRepo.delete(id, tx);
      return deleted;
    });

    if (!ok) {
      const err = new Error("Incidente no encontrado");
      (err as any).statusCode = 404;
      throw err;
    }
  }
}

export const incidentService = new IncidentService();
