import axios from 'axios';

// Create axios instance with base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),

  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  getProfile: () =>
    api.get('/auth/profile'),

  updateProfile: (userData) =>
    api.put('/auth/profile', userData),

  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),

  updateProfilePhoto: (data) => {
    // Check if data is FormData
    if (data instanceof FormData) {
      return api.put('/auth/profile-photo', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } else {
      // Regular JSON data
      return api.put('/auth/profile-photo', data);
    }
  },

  deleteProfilePhoto: () => api.delete('/auth/profile-photo'),
};

// User API
export const userAPI = {
  getCollections: (userId) =>
    api.get(`/users/${userId}/collections`),

  createCollection: (userId, name, description) =>
    api.post('/collections', { user: userId, name, description }),

  getCollectionWritings: (collectionId) =>
    api.get(`/collections/${collectionId}/writings`),

  addWritingToCollection: (collectionId, promptId) =>
    api.post(`/collections/${collectionId}/add-writing`, { promptId }),

  generatePrompt: (data) =>
    api.post('/prompts/generate', data),

  getUserHistory: (userId) =>
    api.get(`/users/${userId}/history`),

  deleteHistoryItem: (itemId) =>
    api.delete(`/prompts/${itemId}`),

  deleteHistoryByDateRange: (userId, startDate, endDate) =>
    api.delete(`/users/${userId}/history/date-range`, { data: { startDate, endDate } }),

  deleteAllHistory: (userId) =>
    api.delete(`/users/${userId}/history`),
};

export default api;
