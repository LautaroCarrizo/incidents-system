
import { Op, type Transaction } from "sequelize";
import {
  AgentModel,
  type AgentAttributes,
} from "../../models/agents/agents.js";
import type { AgentQueryInput } from "../../schemas/agents/agentsSchema.js";
import type { AgentTypes, AgentStatus } from "../../enums/enumsWithZod.js";
export class AgentRepo {
  async findAll(query: AgentQueryInput, tx?: Transaction | null) {
    const { page, pageSize, search, status, agentType, jurisdiction, sort } =
      query;

    const where: any = {};
    if (status) where.status = status;
    if (agentType) where.agentType = agentType;
    if (jurisdiction) where.jurisdiction = { [Op.like]: `%${jurisdiction}%` };
    if (search) where.agentName = { [Op.like]: `%${search}%` };

    let order: any = [["id", "ASC"]];
    if (sort) {
      const dir = sort.startsWith("-") ? "DESC" : "ASC";
      const field = sort.replace(/^[+-]/, "");
      order = [[field, dir]];
    }

    const offset = (page - 1) * pageSize;

    const { rows, count } = await AgentModel.findAndCountAll({
      where,
      order,
      limit: pageSize,
      offset,
      ...(tx ? { transaction: tx } : {}),
    });

    return { rows, count, page, pageSize };
  }

  async findById(id: number, tx?: Transaction | null) {
    return AgentModel.findByPk(id, tx ? { transaction: tx } : undefined);
  }

  async findByUserId(userId: number, tx?: Transaction | null) {
    return AgentModel.findOne({
      where: { userId },
      ...(tx ? { transaction: tx } : {}),
    });
  }
  async create(
    data: {
      agentName: string;
      agentType: AgentTypes;
      userId: number;
      status?: AgentStatus;
      capacity?: number;
      activeAssignmentsCount?: number;
      jurisdiction?: string | null;
      isOnCall?: boolean;
      autoAccept?: boolean;
      lastSeenAt?: Date | null;
    },
    tx?: Transaction | null
  ) {
    return AgentModel.create(
      {
        agentName: data.agentName,
        agentType: data.agentType,
        userId: data.userId,
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.capacity !== undefined ? { capacity: data.capacity } : {}),
        ...(data.activeAssignmentsCount !== undefined
          ? { activeAssignmentsCount: data.activeAssignmentsCount }
          : {}),
        jurisdiction: data.jurisdiction ?? null,
        ...(data.isOnCall !== undefined ? { isOnCall: data.isOnCall } : {}),
        ...(data.autoAccept !== undefined
          ? { autoAccept: data.autoAccept }
          : {}),
        lastSeenAt: data.lastSeenAt ?? null,
      },
      tx ? { transaction: tx } : undefined
    );
  }
  async updatePartial(
    id: number,
    patch: Partial<
      Pick<
        AgentAttributes,
        "agentName" | "agentType" | "status" | "isOnCall" | "capacity" | "jurisdiction" | "autoAccept"
      >
    >,
    tx?: Transaction | null
  ) {
    const agent = await AgentModel.findByPk(
      id,
      tx ? { transaction: tx } : undefined
    );
    if (!agent) return null;
    await agent.update(patch, tx ? { transaction: tx } : undefined);
    return agent;
  }

  async deleteHard(id: number, tx?: Transaction | null) {
    return AgentModel.destroy({
      where: { id },
      ...(tx ? { transaction: tx } : {}),
    });
  }
}

export const agentRepo = new AgentRepo();
