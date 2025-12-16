import { apiRequest } from './httpClient';
import type { ApiResponse } from './types';

export interface AssignmentListItem {
  id: number;
  incidentId: number;
  agentId: number;
  status: string;
  createdAt: string;
}

export interface AssignmentListQuery {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}

export const assignmentsApi = {
  getList: async (query: AssignmentListQuery = {}): Promise<ApiResponse<{ items: AssignmentListItem[]; total: number; page: number; pageSize: number }>> => {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.pageSize) params.append('pageSize', query.pageSize.toString());
    if (query.status) params.append('status', query.status);
    if (query.search) params.append('search', query.search);

    const response = await apiRequest<any>({
      method: 'GET',
      url: `/api/v1/assignments?${params.toString()}`,
    });

    if (response.success) {
      const backendResponse = response as any;
      return {
        success: true,
        data: {
          items: Array.isArray(backendResponse.data) ? backendResponse.data : [],
          total: backendResponse.meta?.total || 0,
          page: backendResponse.meta?.page || query.page || 1,
          pageSize: backendResponse.meta?.pageSize || query.pageSize || 20,
        },
      };
    }
    return response as any;
  },

  getByIncidentId: async (incidentId: number): Promise<ApiResponse<AssignmentListItem | null>> => {
    const response = await apiRequest<any>({
      method: 'GET',
      url: `/api/v1/assignments/incident/${incidentId}`,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data || null,
      };
    }
    return response as any;
  },
};

