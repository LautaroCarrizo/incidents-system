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
    const params = new URLSearchParams();
    if (query.bbox) params.append('bbox', query.bbox);
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.status) params.append('status', query.status);
    if (query.typeIncident) params.append('typeIncident', query.typeIncident);

    return apiRequest<IncidentGeoCollection>({
      method: 'GET',
      url: `/api/v1/incidents/geo?${params.toString()}`,
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

