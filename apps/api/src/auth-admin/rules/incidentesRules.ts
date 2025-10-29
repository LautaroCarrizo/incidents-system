import type { AuthContext } from "../context.js";
import {
  type IncidentType,
  type IncidentStatus,
} from "../../enums/enumsWithZod.js";

type IncidentPatch = {
  message?: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  typeIncident?: IncidentType;
  status?: IncidentStatus;
};

export function canUpdateIncident(
  actor: AuthContext,
  current: { reporterId: number | null }
): {
  allowed: boolean;
  mask?: (p: IncidentPatch) => IncidentPatch;
  reason?: string;
} {
  const isOwner =
    current.reporterId != null && actor.userId === current.reporterId;
  const isAdmin = actor.role === "ADMIN";

  if (!isOwner && !isAdmin) return { allowed: false, reason: "FORBIDDEN" };

  if (isOwner && !isAdmin) {
    return {
      allowed: true,
      mask: (p) => {
        const out: IncidentPatch = {};
        if (p.message !== undefined) out.message = p.message;
        if (p.latitude !== undefined) out.latitude = p.latitude;
        if (p.longitude !== undefined) out.longitude = p.longitude;
        if (p.address !== undefined) out.address = p.address;
        return out;
      },
    };
  }
  return { allowed: true, mask: (p) => p };
}

export function canDeleteIncident(
  actor: AuthContext,
  current: { userId: number }
): { allowed: boolean; reason?: string } {
  const isAdmin = actor.role === "ADMIN";
  const isOwner = actor.userId === current.userId;
  if (!isAdmin && !isOwner) {
    return { allowed: false, reason: "FORBIDDEN" };
  }

  return { allowed: true };
}
