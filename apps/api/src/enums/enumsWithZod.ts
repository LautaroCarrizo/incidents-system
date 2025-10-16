import { z } from "zod";

/* ============================================================
   INCIDENTS
   ============================================================ */

export const IncidentTypeZ = z.enum([
  "ASALTO",
  "INCENDIO",
  "ACCIDENTE",
  "EMERGENCIA",
]);
export type IncidentType = z.infer<typeof IncidentTypeZ>;

export const IncidentStatusZ = z.enum([
  "PENDIENTE",
  "EN_PROGRESO",
  "RESUELTO",
]);
export type IncidentStatus = z.infer<typeof IncidentStatusZ>;

/* ============================================================
   AGENTS
   ============================================================ */
export const AgentStatusZ = z.enum([
  "AVAILABLE",
  "BUSY",
  "OFFLINE",
]);
export type AgentStatus = z.infer<typeof AgentStatusZ>;

/* ============================================================
   ASSIGNMENTS
   ============================================================ */
export const AssignmentStatusZ = z.enum([
  "ASSIGNED",
  "ACCEPTED",
  "REJECTED",
  "IN_PROGRESS",
  "ON_HOLD",
  "RESOLVED",
  "CLOSED",
]);
export type AssignmentStatus = z.infer<typeof AssignmentStatusZ>;

/* ============================================================
   USUARIO 
   ============================================================ */

export const UserRoleZ = z.enum([
  "USER",     // usuario que reporta incidentes
  "ADMIN",    // administrador del sistema
]);
export type UserRole = z.infer<typeof UserRoleZ>;
