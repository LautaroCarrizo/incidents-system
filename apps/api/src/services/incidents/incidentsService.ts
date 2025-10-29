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
import {
  canDeleteIncident,
  canUpdateIncident,
} from "../../auth-admin/rules/incidentesRules.js";
import type { AuthContext } from "../../auth-admin/context.js";


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

  async update(id: number, input: IncidentUpdateInput, actor: AuthContext) {
    const data = IncidentUpdateSchema.parse(input);

    const updated = await sequelize.transaction(async (tx) => {
      const current = await incidentRepo.findById(id, tx);
      if (!current) {
        const err = new Error("Incidente no encontrado por id");
        (err as any).statusCode = 404;
        throw err;
      }

      const decision = canUpdateIncident(actor, {
        reporterId: current.reporterId,
      });
      if (!decision.allowed) {
        const err = new Error("No podés editar este incidente");
        (err as any).statusCode = 403;
        throw err;
      }

      const proposedPatch = {
        ...(data.message !== undefined ? { message: data.message } : {}),
        ...(data.latitude !== undefined ? { latitude: data.latitude } : {}),
        ...(data.longitude !== undefined ? { longitude: data.longitude } : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.typeIncident !== undefined
          ? { typeIncident: data.typeIncident }
          : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      };

      const patch = decision.mask
        ? decision.mask(proposedPatch)
        : proposedPatch;

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
  async delete(id: number, actor: AuthContext) {
    const ok = await sequelize.transaction(async (tx) => {
      const current = await incidentRepo.findById(id, tx);
      if (!current) return null;
      const decision = canDeleteIncident(actor, {
        userId: current.reporterId ?? 0,
      });

      if (!decision.allowed) {
        const err = new Error(decision.reason || "FORBIDDEN");
        (err as any).statusCode = 403;
        throw err;
      }

      return incidentRepo.delete(id, tx);
    });

    if (!ok) {
      const err = new Error("Incidente no encontrado");
      (err as any).statusCode = 404;
      throw err;
    }
  }
}
export const incidentService = new IncidentService();
