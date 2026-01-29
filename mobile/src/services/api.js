import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api/v1'
  : 'https://api.codebasics.io/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken: newToken } = response.data.data;
          setAccessToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Token refresh failed, user needs to login again
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        setAccessToken(null);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleAuth: (idToken) => api.post('/auth/google', { idToken }),
  linkedinAuth: (accessToken) => api.post('/auth/linkedin', { accessToken }),
  appleAuth: (identityToken, user) => api.post('/auth/apple', { identityToken, user }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  deleteAccount: () => api.delete('/auth/account'),
};

// Career Test API
export const careerTestAPI = {
  getAllTests: () => api.get('/career-tests'),
  getQuestions: (role) => api.get(`/career-tests/${role}/questions`),
  submitTest: (role, answers) => api.post(`/career-tests/${role}/submit`, { answers }),
  getResults: (attemptId) => api.get(`/career-tests/results/${attemptId}`),
  compareScores: () => api.get('/career-tests/compare'),
  getHistory: () => api.get('/career-tests/history'),
};

// Skill Test API
export const skillTestAPI = {
  getAllTests: () => api.get('/skill-tests'),
  getTopics: () => api.get('/skill-tests/topics'),
  getTestById: (id) => api.get(`/skill-tests/${id}`),
  getQuestions: (id) => api.get(`/skill-tests/${id}/questions`),
  submitTest: (id, answers) => api.post(`/skill-tests/${id}/submit`, { answers }),
  getHistory: (testId) => api.get('/skill-tests/history', { params: { testId } }),
  getAttemptDetails: (attemptId) => api.get(`/skill-tests/attempts/${attemptId}`),
  getPracticeQuestions: (topic, limit, difficulty) =>
    api.get(`/skill-tests/practice/${topic}`, { params: { limit, difficulty } }),
  submitPracticeAnswer: (questionId, answer) =>
    api.post('/skill-tests/practice/submit', { questionId, answer }),
  getPracticeStats: () => api.get('/skill-tests/practice/stats'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (currentPassword, newPassword) =>
    api.put('/user/change-password', { currentPassword, newPassword }),
  getStats: () => api.get('/user/stats'),
  getBadges: () => api.get('/user/badges'),
  recordActivity: () => api.post('/user/activity'),
  getStreak: () => api.get('/user/streak'),
  recordShare: (platform, contentType, contentId) =>
    api.post('/user/share', { platform, contentType, contentId }),
  getShareHistory: () => api.get('/user/shares'),
};

// Leaderboard API
export const leaderboardAPI = {
  getWeekly: (limit, offset) => api.get('/leaderboard/weekly', { params: { limit, offset } }),
  getAllTime: (limit, offset) => api.get('/leaderboard/alltime', { params: { limit, offset } }),
  getUserRank: () => api.get('/leaderboard/rank'),
};

export default api;
