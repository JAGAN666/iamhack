import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Create axios instance with default config  
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
  resendVerification: (email: string) => api.post('/auth/resend-verification', { email }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
  refreshToken: () => api.post('/auth/refresh'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getStats: () => api.get('/users/stats'),
  getDashboardStats: () => api.get('/users/dashboard-stats'),
};

// Achievement API
export const achievementAPI = {
  getAll: () => api.get('/achievements'),
  getUserAchievements: () => api.get('/achievements/user'),
  submit: (data: any, file?: File) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    if (file) {
      formData.append('proof', file);
    }
    return api.post('/achievements', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  create: (data: any) => api.post('/achievements', data),
  getById: (id: string) => api.get(`/achievements/${id}`),
  update: (id: string, data: any) => api.put(`/achievements/${id}`, data),
  delete: (id: string) => api.delete(`/achievements/${id}`),
};

// NFT API
export const nftAPI = {
  getAll: () => api.get('/nfts'),
  getUserNFTs: () => api.get('/nfts/user'),
  mint: (achievementId: string) => api.post('/nfts/mint', { achievementId }),
  getById: (id: string) => api.get(`/nfts/${id}`),
  getMetadata: (tokenId: string) => api.get(`/nfts/metadata/${tokenId}`),
  evolve: (nftId: string) => api.post(`/nfts/${nftId}/evolve`),
  stack: (nftIds: string[]) => api.post('/nfts/stack', { nftIds }),
};

// Opportunity API
export const opportunityAPI = {
  getAll: (filters?: any) => api.get('/opportunities', { params: filters }),
  getById: (id: string) => api.get(`/opportunities/${id}`),
  apply: (id: string, data?: any) => api.post(`/opportunities/${id}/apply`, data),
  requestAccess: (id: string) => api.post(`/opportunities/${id}/request-access`),
  getApplications: () => api.get('/opportunities/applications'),
  getAccessible: () => api.get('/opportunities/accessible'),
};

// Social API
export const socialAPI = {
  getPosts: (page = 1, limit = 10) => api.get('/social/posts', { params: { page, limit } }),
  createPost: (data: any) => api.post('/social/posts', data),
  likePost: (postId: string) => api.post(`/social/posts/${postId}/like`),
  getProfile: (userId: string) => api.get(`/social/profile/${userId}`),
  updateProfile: (data: any) => api.put('/social/profile', data),
  endorse: (data: any) => api.post('/social/endorse', data),
  getLeaderboard: (type = 'global') => api.get(`/social/leaderboard/${type}`),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getUniversityStats: () => api.get('/analytics/university'),
  getAchievementTrends: () => api.get('/analytics/achievements'),
  getNFTStats: () => api.get('/analytics/nfts'),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getPendingAchievements: () => api.get('/admin/achievements/pending'),
  verifyAchievement: (id: string, approved: boolean, reason?: string) =>
    api.post(`/admin/achievements/${id}/verify`, { approved, reason }),
  getUsers: (page = 1, limit = 20) => api.get('/admin/users', { params: { page, limit } }),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  getOpportunities: () => api.get('/admin/opportunities'),
  createOpportunity: (data: any) => api.post('/admin/opportunities', data),
};

// Health API
export const healthAPI = {
  check: () => api.get('/health'),
  detailed: () => api.get('/health/detailed'),
};

export default api;