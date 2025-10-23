// src/modules/incidents/incidents.repo.ts
import { Op } from "sequelize";
import { IncidentModel } from "../../models/incidents/incidents.js";
import type { IncidentCreateInput } from "../../schemas/incidents/incidentsSchema.js";
class IncidentRepo {
  async findAll(query: any) {
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
    });

    return { rows, count };
  }

  async findById(id: number) {
    return await IncidentModel.findByPk(id);
  }

  async create(data: IncidentCreateInput & { reporterId?: number} ) {
    return await IncidentModel.create(data);
  }

  async update(id: number, data: any) {
    const incident = await IncidentModel.findByPk(id);
    if (!incident) return null;
    return await incident.update(data);
  }

  async delete(id: number) {
    const incident = await IncidentModel.findByPk(id);
    if (!incident) return null;
    await incident.destroy();
    return true;
  }
}

export const incidentRepo = new IncidentRepo();
