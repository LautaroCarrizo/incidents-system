import type { AuthContext } from "../context.js";
import type { AssignmentStatus } from "../../enums/enumsWithZod.js";

type AssignmentPatch = {
  status?: AssignmentStatus;
  notes?: string | null;
  agentId?: number | null;
  incidentId?: number;
};

export function canCreateAssignment(
  actor: AuthContext,
  ctx: { agentOwnerUserId?: number | null }
): { allowed: boolean; reason?: string } {
  const isAdmin = actor.role === "ADMIN";
  const isAgentOwner =
    ctx.agentOwnerUserId != null && ctx.agentOwnerUserId === actor.userId;

  if (!isAdmin && !isAgentOwner) {
    return { allowed: false, reason: "FORBIDDEN" };
  }
  return { allowed: true };
}

export function canUpdateAssignment(
  actor: AuthContext,
  ctx: { agentOwnerUserId?: number }
): {
  allowed: boolean;
  mask?: (p: AssignmentPatch) => AssignmentPatch;
  reason?: string;
} {
  const isAdmin = actor.role === "ADMIN";
  const isAgentOwner = ctx.agentOwnerUserId === actor.userId;

  if (isAdmin) return { allowed: true, mask: (p) => p };

  if (isAgentOwner) {
    return {
      allowed: true,
      mask: (p) => {
        const out: AssignmentPatch = {};
        if (p.status !== undefined) out.status = p.status;
        if (p.notes !== undefined) out.notes = p.notes;
        if (p.agentId !== undefined) out.agentId = p.agentId;
        if (p.incidentId !== undefined) out.incidentId = p.incidentId;
        return out;
      },
    };
  }

  return { allowed: false, reason: "FORBIDDEN" };
}
export function canDeleteAssignment(
  actor: AuthContext,
  ctx: { agentOwnerUserId?: number }
): { allowed: boolean; reason?: string } {
  const isAdmin = actor.role === "ADMIN";
  const isAgentOwner =
    ctx.agentOwnerUserId != null && ctx.agentOwnerUserId === actor.userId;

  if (!isAdmin && !isAgentOwner) {
    return { allowed: false, reason: "FORBIDDEN" };
  }
  return { allowed: true };
}
