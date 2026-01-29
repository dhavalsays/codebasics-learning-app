import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/user/profile'),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/admin/stats'),
  getRecentActivity: () => api.get('/admin/activity'),
  getTestStats: () => api.get('/admin/test-stats'),
};

// Career Questions APIs
export const careerQuestionsAPI = {
  getAll: () => api.get('/admin/career-questions'),
  getById: (id) => api.get(`/admin/career-questions/${id}`),
  create: (data) => api.post('/admin/career-questions', data),
  update: (id, data) => api.put(`/admin/career-questions/${id}`, data),
  delete: (id) => api.delete(`/admin/career-questions/${id}`),
  updateWeights: (id, weights) => api.put(`/admin/career-questions/${id}/weights`, weights),
};

// Skill Tests APIs
export const skillTestsAPI = {
  getAll: () => api.get('/admin/skill-tests'),
  getById: (id) => api.get(`/admin/skill-tests/${id}`),
  create: (data) => api.post('/admin/skill-tests', data),
  update: (id, data) => api.put(`/admin/skill-tests/${id}`, data),
  delete: (id) => api.delete(`/admin/skill-tests/${id}`),
  getStats: (id) => api.get(`/admin/skill-tests/${id}/stats`),
};

// Skill Questions APIs
export const skillQuestionsAPI = {
  getAll: (params) => api.get('/admin/skill-questions', { params }),
  getById: (id) => api.get(`/admin/skill-questions/${id}`),
  create: (data) => api.post('/admin/skill-questions', data),
  update: (id, data) => api.put(`/admin/skill-questions/${id}`, data),
  delete: (id) => api.delete(`/admin/skill-questions/${id}`),
  bulkImport: (testId, questions) => api.post(`/admin/skill-tests/${testId}/questions/import`, { questions }),
};

// Users APIs
export const usersAPI = {
  getAll: (params) => api.get('/admin/users', { params }),
  getById: (id) => api.get(`/admin/users/${id}`),
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  deactivate: (id) => api.post(`/admin/users/${id}/deactivate`),
  activate: (id) => api.post(`/admin/users/${id}/activate`),
  getStats: (id) => api.get(`/admin/users/${id}/stats`),
};

// Badges APIs
export const badgesAPI = {
  getAll: () => api.get('/admin/badges'),
  getById: (id) => api.get(`/admin/badges/${id}`),
  create: (data) => api.post('/admin/badges', data),
  update: (id, data) => api.put(`/admin/badges/${id}`, data),
  delete: (id) => api.delete(`/admin/badges/${id}`),
};

// Leaderboard APIs
export const leaderboardAPI = {
  getWeekly: (limit = 100) => api.get(`/admin/leaderboard/weekly?limit=${limit}`),
  getAllTime: (limit = 100) => api.get(`/admin/leaderboard/all-time?limit=${limit}`),
  resetWeekly: () => api.post('/admin/leaderboard/reset-weekly'),
};

export default api;
