import { create } from 'zustand';
import supabase from '../lib/supabase';
import API from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  // Call once on app mount to restore session
  init: async () => {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) {
      const u = data.session.user;
      set({ user: { id: u.id, email: u.email, name: u.user_metadata?.name } });
    }

    // Keep store in sync when Supabase session changes
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        set({ user: { id: u.id, email: u.email, name: u.user_metadata?.name } });
      } else {
        set({ user: null });
      }
    });
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      const u = data.user;
      set({ user: { id: u.id, email: u.email, name: u.user_metadata?.name }, loading: false });
      return true;
    } catch (err) {
      console.error('[Auth] Login failed:', err.message);
      set({ error: err.message || 'Login failed', loading: false });
      return false;
    }
  },

  signup: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      // Hit our backend which creates the Supabase user + DB profile
      await API.post('/auth/signup', { name, email, password });
      // Auto sign in after signup
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      const u = data.user;
      set({ user: { id: u.id, email: u.email, name: u.user_metadata?.name }, loading: false });
      return true;
    } catch (err) {
      console.error('[Auth] Signup failed:', err.message);
      set({ error: err.response?.data?.error || err.message || 'Signup failed', loading: false });
      return false;
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
