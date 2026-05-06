import { create } from 'zustand';
import api from '../services/api';

const useTaskStore = create((set) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (projectId) => {
    set({ loading: true });
    try {
      const { data } = await api.get('/tasks', { params: { projectId } });
      set({ tasks: data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to fetch tasks', loading: false });
    }
  },

  createTask: async (taskData) => {
    try {
      const { data } = await api.post('/tasks', taskData);
      set((s) => ({ tasks: [data, ...s.tasks] }));
      return data;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to create task' });
    }
  },

  updateTask: async (id, updates) => {
    try {
      const { data } = await api.patch(`/tasks/${id}`, updates);
      set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)) }));
      return data;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to update task' });
    }
  },

  deleteTask: async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to delete task' });
    }
  },

  // Optimistic status update for drag-and-drop
  moveTask: (id, newStatus) => {
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
    }));
  },

  clearError: () => set({ error: null }),
}));

export default useTaskStore;
