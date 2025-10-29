import type { AuthContext } from "../context.js";
import { type AgentStatus, type AgentTypes } from "../../enums/enumsWithZod.js";

export type AgentPatch = {
  agentName?: string;
  jurisdiction?: string | null;
  isOnCall?: boolean;
  agentType?: AgentTypes;
  capacity?: number;
  autoAccept?: boolean;
  status?: AgentStatus;
};

export function canCreateAgent(
  actor: AuthContext,
  input: { userId?: number }
): { allowed: boolean; adjust?: (payload: any) => any; reason?: string } {
  const isAdmin = actor.role === "ADMIN";

  if (!isAdmin) {
    return { allowed: false, reason: "FORBIDDEN" };
  }

  return {
    allowed: true,
    adjust: (payload) => ({
      ...payload,
      userId: input.userId ?? actor.userId,
    }),
  };
}

export function canUpdateAgent(actor: AuthContext): {
  allowed: boolean;
  mask?: (p: AgentPatch) => AgentPatch;
  reason?: string;
} {
  const isAdmin = actor.role === "ADMIN";

  if (!isAdmin) {
    return { allowed: false, reason: "FORBIDDEN" };
  }

  return { allowed: true, mask: (p) => p };
}

export function canDeleteAgent(actor: AuthContext): {
  allowed: boolean;
  reason?: string;
} {
  const isAdmin = actor.role === "ADMIN";

  if (!isAdmin) {
    return { allowed: false, reason: "FORBIDDEN" };
  }

  return { allowed: true };
}
