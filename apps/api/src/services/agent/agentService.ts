import { agentRepo } from "../../repositories/agents/agentsRepo.js";
import {
  AgentUpdateSchema,
  AgentCreateSchema,
  type AgentQueryInput,
  type AgentUpdateInput,
} from "../../schemas/agents/agentsSchema.js";
import { toAgentInfoDto, toAgentListDto } from "../../dtos/agent/agentsDto.js";
import { sequelize } from "../../config/db/sequelizeConn.js";
import {
  canCreateAgent,
  canDeleteAgent,
  canUpdateAgent,
} from "../../auth-admin/rules/agentsRules.js";
import type { AuthContext } from "../../auth-admin/context.js";

class AgentService {
  async paginate(query: AgentQueryInput) {
    const { rows, count, page, pageSize } = await agentRepo.findAll(query);
    return {
      items: toAgentListDto ? toAgentListDto(rows) : rows,
      total: count,
      page,
      pageSize,
    };
  }

  async create(input: unknown, actor: AuthContext) {
    const data = AgentCreateSchema.parse(input);

    const decision = canCreateAgent(actor, { userId: data.userId });
    if (!decision.allowed) {
      const err = new Error(decision.reason || "FORBIDDEN");
      (err as any).statusCode = 403;
      throw err;
    }

    const payload = decision.adjust ? decision.adjust(data) : data;

    const created = await sequelize.transaction(async (tx) => {
      return agentRepo.create(
        {
          agentName: payload.agentName,
          agentType: payload.agentType,
          userId: payload.userId,
          status: payload.status,
          capacity: payload.capacity,
          activeAssignmentsCount: payload.activeAssignmentsCount,
          jurisdiction: payload.jurisdiction ?? null,
          isOnCall: payload.isOnCall,
          autoAccept: payload.autoAccept,
          lastSeenAt: payload.lastSeenAt ?? null,
        },
        tx
      );
    });

    return toAgentInfoDto(created);
  }

  async update(id: number, input: AgentUpdateInput, actor: AuthContext) {
    const data = AgentUpdateSchema.parse(input);

    const decision = canUpdateAgent(actor);
    if (!decision.allowed) {
      const err = new Error(decision.reason || "FORBIDDEN");
      (err as any).statusCode = 403;
      throw err;
    }

    const updated = await sequelize.transaction(async (tx) => {
      const current = await agentRepo.findById(id, tx);
      if (!current) {
        const err = new Error("agente no encontrado por id");
        (err as any).statusCode = 404;
        throw err;
      }

      const proposedPatch = {
        ...(data.agentName !== undefined ? { agentName: data.agentName } : {}),
        ...(data.jurisdiction !== undefined
          ? { jurisdiction: data.jurisdiction ?? null }
          : {}),
        ...(data.isOnCall !== undefined ? { isOnCall: data.isOnCall } : {}),
        ...(data.agentType !== undefined ? { agentType: data.agentType } : {}),
        ...(data.capacity !== undefined ? { capacity: data.capacity } : {}),
        ...(data.autoAccept !== undefined
          ? { autoAccept: data.autoAccept }
          : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      };

      const patch = decision.mask
        ? decision.mask(proposedPatch)
        : proposedPatch;

      const saved = await agentRepo.updatePartial(id, patch, tx);
      if (!saved) {
        const err = new Error("agente no encontrado al actualizar");
        (err as any).statusCode = 404;
        throw err;
      }
      return saved;
    });

    return toAgentInfoDto(updated);
  }

  async delete(id: number, actor: AuthContext) {
    const decision = canDeleteAgent(actor);
    if (!decision.allowed) {
      const err = new Error(decision.reason || "FORBIDDEN");
      (err as any).statusCode = 403;
      throw err;
    }

    const ok = await sequelize.transaction(async (tx) => {
      return agentRepo.deleteHard(id, tx);
    });

    if (!ok) {
      const err = new Error("agente no encontrado");
      (err as any).statusCode = 404;
      throw err;
    }
  }
}

export const agentService = new AgentService();
