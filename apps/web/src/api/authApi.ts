import { apiRequest } from './httpClient';
import type { ApiResponse } from './types';
import type { User } from '../store/authStore';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiRequest<LoginResponse>({
      method: 'POST',
      url: '/api/v1/auth/login',
      data: credentials,
    });
  },
};

