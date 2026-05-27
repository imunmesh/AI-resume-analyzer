import axios from 'axios';
import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Firebase ID token to every request
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
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
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong';

    // Don't reject with just a string – keep the full error but attach a readable message
    error.friendlyMessage = message;
    return Promise.reject(error);
  }
);

// ─── Auth ───
export const syncUser = () => api.post('/auth/sync');

// ─── Resume ───
export const uploadResume = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('resume', file);
  return api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
};

export const analyzeResume = (resumeId) =>
  api.post('/resume/analyze', { resumeId });

export const matchJob = (resumeId, jobDescription) =>
  api.post('/resume/match-job', { resumeId, jobDescription });

export const getHistory = () => api.get('/resume/history');

export const getResume = (id) => api.get(`/resume/${id}`);

export const downloadResumeFile = (id) => api.get(`/resume/${id}/download`, { responseType: 'blob' });

// ─── Admin ───
export const getAdminUsers = () => api.get('/admin/users');

export const getAdminAnalyses = () => api.get('/admin/analyses');

export const getAdminStats = () => api.get('/admin/stats');

export const updateUserRole = (id, role) =>
  api.put(`/admin/users/${id}/role`, { role });

export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

export default api;
