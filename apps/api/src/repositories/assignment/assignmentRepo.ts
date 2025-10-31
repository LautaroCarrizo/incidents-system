import { Op, type Transaction } from "sequelize";
import {
  AssignmentModel,
  type AssignmentAttributes,
} from "../../models/assignment/assignment.js";
import type {
  AssignmentCreateInput,
  AssignmentQueryInput,
  AssignmentUpdateInput,
} from "../../schemas/assignments/assignmentsSchema.js";
import type { AssignmentStatus } from "../../enums/enumsWithZod.js";

class AssignmentRepo {
  async findAll(query: AssignmentQueryInput, tx?: Transaction | null) {
    const { page, pageSize, search, status, sort } = query;

    const where: any = {};
    if (status) where.status = status;
    if (search) where.message = { [Op.like]: `%${search}%` };

    let order: any = [["createdAt", "DESC"]];
    if (sort) {
      const dir = sort.startsWith("-") ? "DESC" : "ASC";
      const col = sort.replace(/^[-+]/, "");
      order = [[col, dir]];
    }
    const offset = (page - 1) * pageSize;

    const { rows, count } = await AssignmentModel.findAndCountAll({
      where,
      order,
      limit: pageSize,
      offset,
      ...(tx ? { transaction: tx } : {}),
    });
    return { rows, count, page, pageSize };
  }
  async create(data: AssignmentCreateInput, tx?: Transaction | null) {
    const payload = {
      incidentId: data.incidentId,
      agentId: data.agentId,
      ...(data.status !== undefined ? { status: data.status } : {}),
      slaDueAt: data.slaDueAt ? new Date(data.slaDueAt) : null,
      notes: data.notes ?? null,
    };

    return AssignmentModel.create(
      payload,
      tx ? { transaction: tx } : undefined
    );
  }

  async findById(id: number, tx?: Transaction | null) {
    return AssignmentModel.findByPk(id, tx ? { transaction: tx } : undefined);
  }
  async findByIncidentId(id: number, tx?: Transaction | null) {
    return AssignmentModel.findOne({
      where: { incidentId: id },
      ...(tx ? { transaction: tx } : {}),
    });
  }

  async update(
    id: number,
    patch: Partial<
      Pick<AssignmentAttributes, "status" | "notes" | "slaDueAt" >
    >,
    tx?: Transaction | null
  ) {
    const assignment = await AssignmentModel.findByPk(
      id,
      tx ? { transaction: tx } : undefined
    );
    if (!assignment) return null;
    return assignment.update(
      patch as any,
      tx ? { transaction: tx } : undefined
    );
  }

  async delete(id: number, tx?: Transaction | null) {
    const assignment = await AssignmentModel.findByPk(
      id,
      tx ? { transaction: tx } : undefined
    );
    if (!assignment) return null;
    await assignment.destroy(tx ? { transaction: tx } : undefined);
    return true;
  }
}
export const assignmentRepo = new AssignmentRepo();
