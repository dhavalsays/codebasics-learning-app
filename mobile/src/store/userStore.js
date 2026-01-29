import { create } from 'zustand';
import { userAPI, leaderboardAPI } from '../services/api';

const useUserStore = create((set, get) => ({
  profile: null,
  stats: null,
  badges: [],
  streak: null,
  weeklyLeaderboard: [],
  allTimeLeaderboard: [],
  userRank: null,
  isLoading: false,
  error: null,

  // Fetch user profile
  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const response = await userAPI.getProfile();
      set({ profile: response.data.data, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false };
    }
  },

  // Update profile
  updateProfile: async (data) => {
    set({ isLoading: true });
    try {
      const response = await userAPI.updateProfile(data);
      const updatedProfile = { ...get().profile, ...response.data.data };
      set({ profile: updatedProfile, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  // Fetch stats
  fetchStats: async () => {
    try {
      const response = await userAPI.getStats();
      set({ stats: response.data.data });
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  // Fetch badges
  fetchBadges: async () => {
    try {
      const response = await userAPI.getBadges();
      set({ badges: response.data.data });
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  // Record activity (for streaks)
  recordActivity: async () => {
    try {
      const response = await userAPI.recordActivity();
      const data = response.data.data;

      // Update streak in profile
      if (get().profile) {
        set({
          profile: {
            ...get().profile,
            currentStreak: data.currentStreak,
          },
          streak: data,
        });
      }

      return { success: true, data };
    } catch (error) {
      return { success: false };
    }
  },

  // Fetch streak info
  fetchStreak: async () => {
    try {
      const response = await userAPI.getStreak();
      set({ streak: response.data.data });
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  // Record social share
  recordShare: async (platform, contentType, contentId) => {
    try {
      const response = await userAPI.recordShare(platform, contentType, contentId);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false };
    }
  },

  // Fetch weekly leaderboard
  fetchWeeklyLeaderboard: async (limit = 50) => {
    set({ isLoading: true });
    try {
      const response = await leaderboardAPI.getWeekly(limit, 0);
      set({
        weeklyLeaderboard: response.data.data.leaderboard,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false };
    }
  },

  // Fetch all-time leaderboard
  fetchAllTimeLeaderboard: async (limit = 50) => {
    set({ isLoading: true });
    try {
      const response = await leaderboardAPI.getAllTime(limit, 0);
      set({
        allTimeLeaderboard: response.data.data.leaderboard,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false };
    }
  },

  // Fetch user's rank
  fetchUserRank: async () => {
    try {
      const response = await leaderboardAPI.getUserRank();
      set({ userRank: response.data.data });
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  // Clear store on logout
  clearStore: () => {
    set({
      profile: null,
      stats: null,
      badges: [],
      streak: null,
      weeklyLeaderboard: [],
      allTimeLeaderboard: [],
      userRank: null,
    });
  },

  clearError: () => set({ error: null }),
}));

export default useUserStore;
