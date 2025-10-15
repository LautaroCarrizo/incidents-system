import { AgentStatus } from "../enums/agentStatus.js";

export interface AgentInfoDto {
  id: number;
  userId: number;
  status: AgentStatus;
  capacity: number;
  activeAssignmentsCount: number;
  jurisdiction: string | null;
  autoAccept: boolean;
  isOnCall: boolean;
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgentListDto {
  id: number;
  userId: number;
  status: AgentStatus;
  capacity: number;
  jurisdiction: string | null;
}

export function toAgentInfoDto(row: any): AgentInfoDto {
  return {
    id: row.id,
    userId: row.userId,
    status: row.status,
    capacity: row.capacity,
    activeAssignmentsCount: row.activeAssignmentsCount,
    jurisdiction: row.jurisdiction ?? null,
    autoAccept: !!row.autoAccept,
    isOnCall: !!row.isOnCall,
    lastSeenAt: row.lastSeenAt ? new Date(row.lastSeenAt).toISOString() : null,
    createdAt: row.createdAt?.toISOString?.() ?? String(row.createdAt),
    updatedAt: row.updatedAt?.toISOString?.() ?? String(row.updatedAt),
  };
}

export function toAgentListDto(row: any): AgentListDto {
  return {
    id: row.id,
    userId: row.userId,
    status: row.status,
    capacity: row.capacity,
    jurisdiction: row.jurisdiction ?? null,
  };
}
