import { assignmentRepo } from "../../repositories/assignment/assignmentRepo.js";
import { agentRepo } from "../../repositories/agents/agentsRepo.js";
import {
  AssignmentUpdateSchema,
  AssignmentCreateSchema,
  type AssignmentCreateInput,
  type AssignmentUpdateInput,
  type AssignmentQueryInput,
} from "../../schemas/assignments/assignmentsSchema.js";
import {
  toAssignmentInfoDto,
  toAssignmentListDto,
} from "../../dtos/assignment/assignmentDto.js";
import { sequelize } from "../../config/db/sequelizeConn.js";
import {
  canCreateAssignment,
  canUpdateAssignment,
  canDeleteAssignment,
} from "../../auth-admin/rules/assignmentsRules.js";
import type { AuthContext } from "../../auth-admin/context.js";

class AssignmentService {
  async paginate(query: AssignmentQueryInput) {
    const { rows, count } = await assignmentRepo.findAll(query);
    return {
      items: rows.map(toAssignmentListDto),
      total: count,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async create(input: AssignmentCreateInput, actor: AuthContext) {
    const data = AssignmentCreateSchema.parse(input);
    const agent = await agentRepo.findById(data.agentId);
    if (!agent) {
      const err = new Error("agente no encontrado por id");
      (err as any).statusCode = 404;
      throw err;
    }

    const decision = canCreateAssignment(actor, {
      agentOwnerUserId: agent.userId,
    });
    if (!decision.allowed) {
      const err = new Error(decision.reason || "FORBIDDEN");
      (err as any).statusCode = 403;
      throw err;
    }

    const dto: AssignmentCreateInput = {
      ...data,
      slaDueAt: data.slaDueAt ?? null,
      notes: data.notes ?? null,
      ...(data.status !== undefined ? { status: data.status } : {}),
    };

    const created = await sequelize.transaction(async (tx) => {
      return assignmentRepo.create(dto, tx);
    });

    if (!created) {
      const err = new Error("Error al crear el assignment");
      (err as any).statusCode = 500;
      throw err;
    }

    return toAssignmentInfoDto(created);
  }

  async update(id: number, input: AssignmentUpdateInput, actor: AuthContext) {
    const data = AssignmentUpdateSchema.parse(input);

    const updated = await sequelize.transaction(async (tx) => {
      const current = await assignmentRepo.findById(id, tx);
      if (!current) {
        const err = new Error("assignment no encontrado por id");
        (err as any).statusCode = 404;
        throw err;
      }

      // Resolver owner del agente actual (no del body)
      const currentAgent = await agentRepo.findById(current.agentId, tx);
      const ownerUserId = currentAgent?.userId ?? null;

      const decision = canUpdateAssignment(actor, {
        agentOwnerUserId: ownerUserId,
      });
      if (!decision.allowed) {
        const err = new Error(decision.reason || "FORBIDDEN");
        (err as any).statusCode = 403;
        throw err;
      }

      // Owner: campos “blandos”. Fechas ya son Date|null si el schema hace transform.
      const proposedOwnerPatch = {
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.slaDueAt !== undefined ? { slaDueAt: data.slaDueAt } : {}),
        ...(data.acceptedAt !== undefined
          ? { acceptedAt: data.acceptedAt }
          : {}),
        ...(data.startedAt !== undefined ? { startedAt: data.startedAt } : {}),
        ...(data.resolvedAt !== undefined
          ? { resolvedAt: data.resolvedAt }
          : {}),
        ...(data.closedAt !== undefined ? { closedAt: data.closedAt } : {}),
      };

      const proposedAdminPatch = {
        ...proposedOwnerPatch,
        ...(data.agentId !== undefined ? { agentId: data.agentId } : {}),
        ...(data.incidentId !== undefined
          ? { incidentId: data.incidentId }
          : {}),
      };

      const basePatch =
        actor.role === "ADMIN" ? proposedAdminPatch : proposedOwnerPatch;

      const patch = decision.mask ? decision.mask(basePatch) : basePatch;

      const saved = await assignmentRepo.update(id, patch, tx);
      if (!saved) {
        const err = new Error("assignment no encontrado al actualizar");
        (err as any).statusCode = 404;
        throw err;
      }
      return saved;
    });

    return toAssignmentInfoDto(updated);
  }

  async getByIdOrThrow(id: number) {
    const found = await assignmentRepo.findById(id);
    if (!found) {
      const err = new Error("assignment no encontrado por id");
      (err as any).statusCode = 404;
      throw err;
    }
    return toAssignmentInfoDto(found);
  }

  async getByIncidentId(incidentId: number) {
    // Un incidente puede tener varios assignments
    const rows = await assignmentRepo.findByIncidentId(incidentId);
    // findByIncidentId debería devolver array; si devolvés [] no es 404
    return toAssignmentListDto(rows);
  }

  async delete(id: number, actor: AuthContext) {
    const current = await assignmentRepo.findById(id);
    if (!current) {
      const err = new Error("assignment no encontrado por id");
      (err as any).statusCode = 404;
      throw err;
    }

    const agent = await agentRepo.findById(current.agentId);
    const ownerUserId = agent?.userId ?? null;

    const decision = canDeleteAssignment(actor, {
      agentOwnerUserId: ownerUserId,
    });
    if (!decision.allowed) {
      const err = new Error(decision.reason || "FORBIDDEN");
      (err as any).statusCode = 403;
      throw err;
    }

    await sequelize.transaction(async (tx) => {
      await assignmentRepo.delete(id, tx);
    });
  }
}

export const assignmentService = new AssignmentService();
