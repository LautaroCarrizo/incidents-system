import type { AssignmentStatus } from "../../enums/enumsWithZod.js";

export interface AssignmentInfoDto {
  id: number;
  incidentId: number;
  agentId: number;
  status: AssignmentStatus;
  slaDueAt: string | null;
  acceptedAt: string | null;
  startedAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentListDto {
  id: number;
  incidentId: number;
  agentId: number;
  status: AssignmentStatus;
  createdAt: string;
}

export function toAssignmentInfoDto(row: any): AssignmentInfoDto {
  const toIso = (d: any) => (d ? new Date(d).toISOString() : null);
  return {
    id: row.id,
    incidentId: row.incidentId,
    agentId: row.agentId,
    status: row.status,
    slaDueAt: toIso(row.slaDueAt),
    acceptedAt: toIso(row.acceptedAt),
    startedAt: toIso(row.startedAt),
    resolvedAt: toIso(row.resolvedAt),
    closedAt: toIso(row.closedAt),
    notes: row.notes ?? null,
    createdAt: row.createdAt?.toISOString?.() ?? String(row.createdAt),
    updatedAt: row.updatedAt?.toISOString?.() ?? String(row.updatedAt),
  };
}

export function toAssignmentListDto(row: any): AssignmentListDto {
  return {
    id: row.id,
    incidentId: row.incidentId,
    agentId: row.agentId,
    status: row.status,
    createdAt: row.createdAt?.toISOString?.() ?? String(row.createdAt),
  };
}
