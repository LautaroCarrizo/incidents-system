import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';
import type { ApiResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: agrega token si existe
httpClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: normaliza respuestas
httpClient.interceptors.response.use(
  (response) => {
    // Retornamos response.data (el wrapper del backend)
    return response.data;
  },
  (error) => {
    // Si hay error 401 (Unauthorized), limpiar auth y redirigir al login
    if (error.response?.status === 401) {
      const { clearAuth } = useAuthStore.getState();
      clearAuth();
      // Redirigir al login solo si estamos en el navegador
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    // Si hay error de red o del servidor, lo normalizamos
    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject({
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error.message || 'Network error occurred',
      },
    });
  }
);

// Helper para hacer requests tipados
export async function apiRequest<T>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response = await httpClient.request(config);
    // El interceptor ya retorna response.data, que debería ser ApiResponse<T>
    return response as unknown as ApiResponse<T>;
  } catch (error: any) {
    // Si el error ya tiene formato ApiErr, lo retornamos
    if (error && typeof error === 'object' && 'success' in error && error.success === false) {
      return error as ApiResponse<T>;
    }
    // Sino, creamos un error genérico
    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: error?.message || 'An unknown error occurred',
      },
    };
  }
}
