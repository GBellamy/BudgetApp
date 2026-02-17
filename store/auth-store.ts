import { create } from 'zustand';
import { User } from '../types/user';
import { getToken, setToken, deleteToken } from '../lib/secure-storage';
import apiClient from '../lib/api-client';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  hydrate: async () => {
    try {
      const token = await getToken();
      if (token) {
        const response = await apiClient.get('/api/auth/me');
        set({ user: response.data, token, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      await deleteToken();
      set({ user: null, token: null, isLoading: false });
    }
  },

  login: async (username: string, password: string) => {
    const response = await apiClient.post('/api/auth/login', { username, password });
    const { token, user } = response.data;
    await setToken(token);
    set({ user, token });
  },

  logout: async () => {
    await deleteToken();
    set({ user: null, token: null });
  },
}));
