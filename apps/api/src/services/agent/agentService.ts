import { agentRepo } from "../../repositories/agents/agentsRepo.js";
import {
  AgentUpdateSchema,
  AgentCreateSchema,
  type AgentQueryInput,
  type AgentCreateInput,
  type AgentUpdateInput,
} from "../../schemas/agents/agentsSchema.js";
import { toAgentInfoDto, toAgentListDto } from "../../dtos/agent/agentsDto.js";
import { sequelize } from "../../config/db/sequelizeConn.js";

type Ctx = { userId?: number; role?: "ADMIN" | "USER" };

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

  async create(input: unknown) {
    const data = AgentCreateSchema.parse(input);
    const created = await sequelize.transaction(async (tx) => {
      return agentRepo.create(
        {
          agentName: data.agentName,
          agentType: data.agentType,
          userId: data.userId,
          status: data.status,
          capacity: data.capacity,
          activeAssignmentsCount: data.activeAssignmentsCount,
          jurisdiction: data.jurisdiction ?? null,
          isOnCall: data.isOnCall,
          autoAccept: data.autoAccept,
          lastSeenAt: data.lastSeenAt ?? null,
        },
        tx
      );
    });

    return toAgentInfoDto(created);
  }

  async update(id: number, input: AgentUpdateInput, ctx: Ctx) {
    const data = AgentUpdateSchema.parse(input);
    const updated = await sequelize.transaction(async (tx) => {
      const current = await agentRepo.findById(id, tx);
      if (!current) {
        const err = new Error("Agente no encontrado por id");
        (err as any).statusCode = 404;
        throw err;
      }
      const isAdmin = ctx?.role === "ADMIN";
      if (!isAdmin) {
        const err = new Error("No podés editar este Agente");
        (err as any).statusCode = 403;
        throw err;
      }
      const patchAdmin = {
        agentName: data.agentName ?? current.agentName,
        agentType: data.agentType ?? current.agentType,
        status: data.status ?? current.status,
        capacity: data.capacity ?? current.capacity,
        jurisdiction: data.jurisdiction ?? current.jurisdiction,
        isOnCall: data.isOnCall ?? current.isOnCall,
      };
      const saved = await agentRepo.updatePartial(id, patchAdmin, tx);
      if (!saved) {
        const err = new Error("Agente no encontrado al actualizar");
        (err as any).statusCode = 404;
        throw err;
      }

      return saved;
    });

    return toAgentInfoDto(updated);
  }
  async softDelete(id: number, ctx?: Ctx) {
    const ok = await sequelize.transaction(async (tx) => {
      const current = await agentRepo.findById(id, tx);
      if (!current) {
        const err = new Error("Agente no encontrado");
        (err as any).statusCode = 404;
        throw err;
      }
      const isAdmin = ctx?.role === "ADMIN";
      if (!isAdmin) {
        const err = new Error("No podés eliminar este agente");
        (err as any).statusCode = 403;
        throw err;
      }

      const deleted = await agentRepo.deleteHard(id, tx);
      return deleted;
    });

    if (!ok) {
      const err = new Error("Incidente no encontrado");
      (err as any).statusCode = 404;
      throw err;
    }
  }
}
export const agentService = new AgentService();
