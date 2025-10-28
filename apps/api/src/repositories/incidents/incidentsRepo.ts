// src/modules/incidents/incidents.repo.ts
import { Op, type Transaction } from "sequelize";
import {
  IncidentModel,
  type IncidentAttributes,
} from "../../models/incidents/incidents.js";
import type { IncidentCreateInput } from "../../schemas/incidents/incidentsSchema.js";
import type { IncidentQueryInput } from "../../schemas/incidents/incidentsSchema.js";


class IncidentRepo {
  async findAll(query: IncidentQueryInput, tx?: Transaction | null) {
    const { page, pageSize, search, status, typeIncident, sort } = query;

    const where: any = {};
    if (status) where.status = status;
    if (typeIncident) where.typeIncident = typeIncident;
    if (search) where.message = { [Op.like]: `%${search}%` };

    let order: any = [["createdAt", "DESC"]];
    if (sort) {
      const dir = sort.startsWith("-") ? "DESC" : "ASC";
      const col = sort.replace(/^[-+]/, "");
      order = [[col, dir]];
    }

    const offset = (page - 1) * pageSize;

    const { rows, count } = await IncidentModel.findAndCountAll({
      where,
      order,
      limit: pageSize,
      offset,
      ...(tx ? { transaction: tx } : {}),
    });

    return { rows, count };
  }

  async findById(id: number, tx?: Transaction | null) {
    return IncidentModel.findByPk(id, tx ? { transaction: tx } : undefined);
  }

async create(data: IncidentCreateInput & { reporterId: number }, tx?: Transaction | null) {
  return IncidentModel.create(
    {
      message: data.message,
      typeIncident: data.typeIncident,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      address: data.address ?? null,
      reporterId: data.reporterId,
    },
    tx ? { transaction: tx } : undefined
  );
}

  async update(
    id: number,
    patch: Partial<
      Pick<
        IncidentAttributes,
        "typeIncident" | "message" | "latitude" | "longitude" | "address" | "status"
      >
    >,
    tx?: Transaction | null
  ) {
    const incident = await IncidentModel.findByPk(id, tx ? { transaction: tx } : undefined);
    if (!incident) return null;
    return incident.update(patch as any, tx ? { transaction: tx } : undefined);
  }

  async delete(id: number, tx?: Transaction | null) {
    const incident = await IncidentModel.findByPk(id, tx ? { transaction: tx } : undefined);
    if (!incident) return null;
    await incident.destroy(tx ? { transaction: tx } : undefined);
    return true;
  }
}

export const incidentRepo = new IncidentRepo();
