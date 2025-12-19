import { apiRequest } from './httpClient';
import type { ApiResponse } from './types';

export interface IncidentGeoFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    id: number;
    typeIncident: string;
    status: string;
    message: string;
    address: string | null;
    createdAt: string;
  };
}

export interface IncidentGeoCollection {
  type: 'FeatureCollection';
  features: IncidentGeoFeature[];
}

export interface IncidentListItem {
  id: number;
  typeIncident: string;
  status: string;
  message: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

export interface IncidentListResponse {
  items: IncidentListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface IncidentGeoQuery {
  bbox?: string; // "minLng,minLat,maxLng,maxLat"
  limit?: number;
  status?: string;
  typeIncident?: string;
}

/**
 * Construye un bbox válido desde los bounds del mapa
 * @param bounds - Objeto con minLng, minLat, maxLng, maxLat
 * @returns String en formato "minLng,minLat,maxLng,maxLat" o null si es inválido
 */
export function buildBBoxFromBounds(bounds: {
  minLng?: number;
  minLat?: number;
  maxLng?: number;
  maxLat?: number;
} | null | undefined): string | null {
  if (!bounds) return null;
  
  const { minLng, minLat, maxLng, maxLat } = bounds;
  
  // Verificar que todos los valores existan y sean números finitos
  if (
    typeof minLng !== 'number' || !Number.isFinite(minLng) ||
    typeof minLat !== 'number' || !Number.isFinite(minLat) ||
    typeof maxLng !== 'number' || !Number.isFinite(maxLng) ||
    typeof maxLat !== 'number' || !Number.isFinite(maxLat)
  ) {
    return null;
  }
  
  // Retornar string en formato exacto: "minLng,minLat,maxLng,maxLat"
  return `${minLng},${minLat},${maxLng},${maxLat}`;
}

export interface IncidentListQuery {
  page?: number;
  pageSize?: number;
  status?: string;
  typeIncident?: string;
  search?: string;
}

export interface IncidentCreateInput {
  typeIncident: 'ROBBERY' | 'FIRE' | 'ACCIDENT' | 'EMERGENCY';
  message: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
}

export interface IncidentInfo {
  id: number;
  typeIncident: string;
  message: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  reporterId: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const incidentsApi = {
  getGeo: async (query: IncidentGeoQuery = {}): Promise<ApiResponse<IncidentGeoCollection>> => {
    // Construir params base con limit
    const params: Record<string, string> = {
      limit: (query.limit || 200).toString(),
    };
    
    // Validar bbox antes de agregarlo
    const validBbox = query.bbox ? buildBBoxFromBounds(
      (() => {
        const parts = query.bbox.split(',');
        if (parts.length !== 4) return null;
        const [minLng, minLat, maxLng, maxLat] = parts.map(Number);
        return { minLng, minLat, maxLng, maxLat };
      })()
    ) : null;
    
    // Solo agregar bbox si es válido
    if (validBbox) {
      params.bbox = validBbox;
    }
    
    // Agregar otros parámetros opcionales
    if (query.status) params.status = query.status;
    if (query.typeIncident) params.typeIncident = query.typeIncident;

    console.debug('Fetching incidents with params:', params);

    return apiRequest<IncidentGeoCollection>({
      method: 'GET',
      url: `/api/v1/incidents/geo?${new URLSearchParams(params).toString()}`,
    });
  },

  getList: async (query: IncidentListQuery = {}): Promise<ApiResponse<{ items: IncidentListItem[]; total: number; page: number; pageSize: number }>> => {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.pageSize) params.append('pageSize', query.pageSize.toString());
    if (query.status) params.append('status', query.status);
    if (query.typeIncident) params.append('typeIncident', query.typeIncident);
    if (query.search) params.append('search', query.search);

    // El backend devuelve: { success: true, data: [...items], meta: {...} }
    // El interceptor de httpClient retorna response.data directamente, que ya es { success, data, meta }
    const response = await apiRequest<{ data: IncidentListItem[]; meta: { page: number; pageSize: number; total: number } }>({
      method: 'GET',
      url: `/api/v1/incidents?${params.toString()}`,
    }) as any;

    // Transformar la respuesta al formato esperado
    if (response.success) {
      return {
        success: true,
        data: {
          items: Array.isArray(response.data) ? response.data : [],
          total: response.meta?.total || 0,
          page: response.meta?.page || query.page || 1,
          pageSize: response.meta?.pageSize || query.pageSize || 20,
        },
      };
    }
    
    return response;
  },

  create: async (input: IncidentCreateInput): Promise<ApiResponse<IncidentInfo>> => {
    return apiRequest<IncidentInfo>({
      method: 'POST',
      url: '/api/v1/incidents',
      data: input,
    });
  },
};

