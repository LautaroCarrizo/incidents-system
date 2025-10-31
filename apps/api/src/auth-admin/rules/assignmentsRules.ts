import type { AuthContext } from "../context.js";
import type { AssignmentStatus } from "../../enums/enumsWithZod.js";

type AssignmentPatch = {
  status?: AssignmentStatus;
  notes?: string | null;
  agentId?: number;
  incidentId?: number;
  slaDueAt?: Date | null;
  acceptedAt?: Date | null;
  startedAt?: Date | null;
  resolvedAt?: Date | null;
  closedAt?: Date | null;
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
  ctx: { agentOwnerUserId?: number | null }
): {
  allowed: boolean;
  mask?: (p: AssignmentPatch) => AssignmentPatch;
  reason?: string;
} {
  const isAdmin = actor.role === "ADMIN";
  const isAgentOwner =
    ctx.agentOwnerUserId != null && ctx.agentOwnerUserId === actor.userId;

  if (isAdmin) {
    return { allowed: true, mask: (p) => p };
  }

  if (isAgentOwner) {
    return {
      allowed: true,
      mask: (p) => ({
        ...(p.status !== undefined ? { status: p.status } : {}),
        ...(p.notes !== undefined ? { notes: p.notes } : {}),
        ...(p.slaDueAt !== undefined ? { slaDueAt: p.slaDueAt } : {}),
        ...(p.acceptedAt !== undefined ? { acceptedAt: p.acceptedAt } : {}),
        ...(p.startedAt !== undefined ? { startedAt: p.startedAt } : {}),
        ...(p.resolvedAt !== undefined ? { resolvedAt: p.resolvedAt } : {}),
        ...(p.closedAt !== undefined ? { closedAt: p.closedAt } : {}),
      }),
    };
  }

  return { allowed: false, reason: "FORBIDDEN" };
}
export function canDeleteAssignment(
  actor: AuthContext,
  ctx: { agentOwnerUserId?: number | null}
): { allowed: boolean; reason?: string } {
  const isAdmin = actor.role === "ADMIN";
  const isAgentOwner =
    ctx.agentOwnerUserId != null && ctx.agentOwnerUserId === actor.userId;

  if (!isAdmin && !isAgentOwner) {
    return { allowed: false, reason: "FORBIDDEN" };
  }
  return { allowed: true };
}
