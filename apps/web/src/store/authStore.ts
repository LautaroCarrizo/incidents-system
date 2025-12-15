import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => {
    console.log('setAuth called', { user, token });
    set({ user, token });
  },
  clearAuth: () => {
    console.log('clearAuth called');
    set({ user: null, token: null });
  },
}));

