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

    const response = await apiRequest<{ data: IncidentListItem[]; meta: { page: number; pageSize: number; total: number } }>({
      method: 'GET',
      url: `/api/v1/incidents?${params.toString()}`,
    });

    // Transformar la respuesta del backend al formato esperado
    if (response.success) {
      return {
        success: true,
        data: {
          items: response.data.data,
          total: response.data.meta.total,
          page: response.data.meta.page,
          pageSize: response.data.meta.pageSize,
        },
      };
    }
    return response;
  },
};

