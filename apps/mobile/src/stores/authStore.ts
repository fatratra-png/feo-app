import { create } from 'zustand';
import { setTokens, clearTokens, api } from '../lib/api';

interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const { user, accessToken, refreshToken } = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setTokens(accessToken, refreshToken);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  register: async (email, password, displayName) => {
    const { user, accessToken, refreshToken } = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
    setTokens(accessToken, refreshToken);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const user = await api('/auth/me');
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));