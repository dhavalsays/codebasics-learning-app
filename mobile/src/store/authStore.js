import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authAPI, setAccessToken } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Initialize auth state from storage
  initialize: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const userJson = await SecureStore.getItemAsync('user');

      if (accessToken && userJson) {
        setAccessToken(accessToken);
        const user = JSON.parse(userJson);
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false });
    }
  },

  // Register with email/password
  register: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register({ email, password, name });
      const { user, accessToken, refreshToken } = response.data.data;

      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      await SecureStore.setItemAsync('user', JSON.stringify(user));

      setAccessToken(accessToken);
      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  // Login with email/password
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login({ email, password });
      const { user, accessToken, refreshToken } = response.data.data;

      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      await SecureStore.setItemAsync('user', JSON.stringify(user));

      setAccessToken(accessToken);
      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  // Google OAuth
  googleAuth: async (idToken) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.googleAuth(idToken);
      const { user, accessToken, refreshToken } = response.data.data;

      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      await SecureStore.setItemAsync('user', JSON.stringify(user));

      setAccessToken(accessToken);
      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Google authentication failed';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  // Apple Sign-In
  appleAuth: async (identityToken, userInfo) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.appleAuth(identityToken, userInfo);
      const { user, accessToken, refreshToken } = response.data.data;

      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      await SecureStore.setItemAsync('user', JSON.stringify(user));

      setAccessToken(accessToken);
      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Apple authentication failed';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  // Logout
  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore logout errors
    }

    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');

    setAccessToken(null);
    set({ user: null, isAuthenticated: false, error: null });
  },

  // Update user in store
  updateUser: async (userData) => {
    const currentUser = get().user;
    const updatedUser = { ...currentUser, ...userData };
    await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
