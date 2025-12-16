import { apiRequest } from './httpClient';
import type { ApiResponse } from './types';
import type { User } from '../store/authStore';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  isAdmin?: boolean;
}

interface LoginResponse {
  user: User;
  accessToken: string;
}

interface RegisterResponse {
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

  register: async (data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
    return apiRequest<RegisterResponse>({
      method: 'POST',
      url: '/api/v1/auth/register',
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        isAdmin: data.isAdmin ?? false,
      },
    });
  },
};

