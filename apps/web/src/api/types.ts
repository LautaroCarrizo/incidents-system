// API Response Types
export interface ApiOk<T> {
  success: true;
  data: T;
}

export interface ApiErr {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]> | string;
  };
}

export type ApiResponse<T> = ApiOk<T> | ApiErr;

