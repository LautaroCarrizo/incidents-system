import { apiRequest } from './httpClient';
import type { ApiResponse } from './types';

export interface UserListItem {
  id: number;
  name: string;
  email: string;
  isAdmin?: boolean; // Puede no estar en UserListDto, pero lo manejaremos si viene
}

export interface UserListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const usersApi = {
  getList: async (query: UserListQuery = {}): Promise<ApiResponse<{ items: UserListItem[]; total: number; page: number; pageSize: number }>> => {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.pageSize) params.append('pageSize', query.pageSize.toString());
    if (query.search) params.append('search', query.search);

    const response = await apiRequest<any>({
      method: 'GET',
      url: `/api/v1/users?${params.toString()}`,
    });

    if (response.success) {
      const backendResponse = response as any;
      // El backend devuelve: { success: true, data: { items: [...], total, page, pageSize } }
      // O a veces directamente { success: true, data: [...] }
      const items = Array.isArray(backendResponse.data) 
        ? backendResponse.data 
        : (backendResponse.data?.items || []);
      const meta = Array.isArray(backendResponse.data) 
        ? { total: items.length, page: query.page || 1, pageSize: query.pageSize || 20 }
        : (backendResponse.data || {});

      return {
        success: true,
        data: {
          items: items,
          total: meta.total || items.length,
          page: meta.page || query.page || 1,
          pageSize: meta.pageSize || query.pageSize || 20,
        },
      };
    }
    return response as any;
  },
};


