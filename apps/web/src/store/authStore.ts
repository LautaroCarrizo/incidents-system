import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (data: { user: User; token: string }) => void;
  clearAuth: () => void;
}

const STORAGE_KEY = 'auth-storage';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (data: { user: User; token: string }) => {
        set({ user: data.user, token: data.token });
      },
      clearAuth: () => {
        set({ user: null, token: null });
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
);

