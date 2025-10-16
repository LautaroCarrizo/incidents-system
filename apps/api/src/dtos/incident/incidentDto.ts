import { IncidentType } from "../../enums/incidentType.js";

export interface IncidentInfoDto {
  id: number;
  typeIncident: IncidentType;
  message: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  reporterId: number | null;
  status: "PENDIENTE" | "EN_PROGRESO" | "RESUELTO";
  createdAt: string;
  updatedAt: string;
}

export interface IncidentListDto {
  id: number;
  typeIncident: IncidentType;
  status: string;
  createdAt: string;
  address: string | null;
}

export function toIncidentInfoDto(row: any): IncidentInfoDto {
  return {
    id: row.id,
    typeIncident: row.typeIncident,
    message: row.message,
    latitude: row.latitude !== null ? Number(row.latitude) : null,
    longitude: row.longitude !== null ? Number(row.longitude) : null,
    address: row.address ?? null,
    reporterId: row.reporterId ?? null,
    status: row.status,
    createdAt: row.createdAt?.toISOString?.() ?? String(row.createdAt),
    updatedAt: row.updatedAt?.toISOString?.() ?? String(row.updatedAt),
  };
}

export function toIncidentListDto(row: any): IncidentListDto {
  return {
    id: row.id,
    typeIncident: row.typeIncident,
    status: row.status,
    address: row.address ?? null,
    createdAt: row.createdAt?.toISOString?.() ?? String(row.createdAt),
  };
}
