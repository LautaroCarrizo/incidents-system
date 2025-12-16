import { apiRequest } from './httpClient';
import type { ApiResponse } from './types';

export interface AgentListItem {
  id: number;
  userId: number;
  status: string;
  capacity: number;
  jurisdiction: string | null;
  agentName?: string; // Puede no estar en el DTO pero lo usaremos si está disponible
  agentType?: string;
  activeAssignmentsCount?: number;
}

export interface AgentListQuery {
  page?: number;
  pageSize?: number;
  status?: string;
  agentType?: string;
  jurisdiction?: string;
  search?: string;
}

export const agentsApi = {
  getList: async (query: AgentListQuery = {}): Promise<ApiResponse<{ items: AgentListItem[]; total: number; page: number; pageSize: number }>> => {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.pageSize) params.append('pageSize', query.pageSize.toString());
    if (query.status) params.append('status', query.status);
    if (query.agentType) params.append('agentType', query.agentType);
    if (query.jurisdiction) params.append('jurisdiction', query.jurisdiction);
    if (query.search) params.append('search', query.search);

    const response = await apiRequest<any>({
      method: 'GET',
      url: `/api/v1/agents?${params.toString()}`,
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

  getById: async (id: number): Promise<ApiResponse<AgentListItem>> => {
    const response = await apiRequest<any>({
      method: 'GET',
      url: `/api/v1/agents/${id}`,
    });
    return response as any;
  },
};

