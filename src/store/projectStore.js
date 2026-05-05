import { create } from 'zustand';
import api from '../lib/api';

const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/projects');
      set({ projects: data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to fetch projects', loading: false });
    }
  },

  fetchProject: async (id) => {
    set({ loading: true });
    try {
      const { data } = await api.get(`/projects/${id}`);
      set({ currentProject: data, loading: false });
      return data;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to fetch project', loading: false });
    }
  },

  createProject: async (name, description) => {
    try {
      const { data } = await api.post('/projects', { name, description });
      set((s) => ({ projects: [data, ...s.projects] }));
      return data;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to create project' });
    }
  },

  updateProject: async (id, updates) => {
    try {
      const { data } = await api.patch(`/projects/${id}`, updates);
      set((s) => ({
        projects: s.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
        currentProject: s.currentProject?.id === id ? { ...s.currentProject, ...data } : s.currentProject,
      }));
      return data;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to update project' });
    }
  },

  deleteProject: async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      set((s) => ({
        projects: s.projects.filter((p) => p.id !== id),
        currentProject: s.currentProject?.id === id ? null : s.currentProject,
      }));
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to delete project' });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useProjectStore;
