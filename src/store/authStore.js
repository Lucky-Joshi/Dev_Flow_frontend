import { create } from 'zustand';
import API from '../services/api';

const TOKEN_KEY = 'devflow_token';
const USER_KEY  = 'devflow_user';

const useAuthStore = create((set) => ({
  user:    JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
  token:   localStorage.getItem(TOKEN_KEY) || null,
  loading: false,
  error:   null,

  init: () => {
    // Session already restored from localStorage above — nothing async needed.
    // If token is present, API interceptor will attach it automatically.
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await API.post('/auth/login', { email, password });
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return true;
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid credentials';
      set({ error: msg, loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
