import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('adminToken'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data.data;

      // Check if user is admin
      if (user.role !== 'admin') {
        set({ isLoading: false, error: 'Access denied. Admin privileges required.' });
        return { success: false, error: 'Access denied' };
      }

      localStorage.setItem('adminToken', token);
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }

    try {
      const response = await authAPI.getProfile();
      const user = response.data.data;

      if (user.role !== 'admin') {
        get().logout();
        return;
      }

      set({ user, isAuthenticated: true });
    } catch (error) {
      get().logout();
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
