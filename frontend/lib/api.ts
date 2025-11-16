import axios from 'axios';

// Use Backend Express API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API Functions

// Auth
export const authAPI = {
  register: (data: { email: string; password: string; displayName: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
  changePassword: (data: { userId: string; currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
};

// Questions
export const questionAPI = {
  getAll: (params?: { sort?: string; tag?: string; search?: string; page?: number; limit?: number; status?: string }) =>
    api.get('/questions', { params }),
  getById: (id: string) =>
    api.get(`/questions/${id}`),
  create: (data: { title: string; content: string; tags: string[]; community_slug?: string; images?: string[] }) =>
    api.post('/questions', data),
  update: (id: string, data: { title: string; content: string; tags?: string[] }) =>
    api.put(`/questions/${id}`, data),
  delete: (id: string) =>
    api.delete(`/questions/${id}`),
  close: (id: string) =>
    api.post(`/questions/${id}/close`),
  incrementView: (id: string) =>
    api.post(`/questions/${id}/view`),
};

// Answers
export const answerAPI = {
  create: (data: { content: string; questionId: string }) =>
    api.post('/answers', data),
  update: (id: string, content: string) =>
    api.put(`/answers/${id}`, { content }),
  delete: (id: string) =>
    api.delete(`/answers/${id}`),
  accept: (id: string) =>
    api.post(`/answers/${id}/accept`),
};

// Comments
export const commentAPI = {
  create: (data: { content: string; commentableType: string; commentableId: string }) =>
    api.post('/comments', data),
  update: (id: string, content: string) =>
    api.put(`/comments/${id}`, { content }),
  delete: (id: string) =>
    api.delete(`/comments/${id}`),
};

// Votes
export const voteAPI = {
  cast: (data: { votableType: string; votableId: string; voteType: string }) =>
    api.post('/votes', { 
      targetType: data.votableType, 
      targetId: data.votableId, 
      voteType: data.voteType 
    }),
  remove: (id: string) =>
    api.delete(`/votes/${id}`),
};

// Users
export const userAPI = {
  getAll: (params?: { sort?: string }) =>
    api.get('/users', { params }),
  getProfile: (id: string) =>
    api.get(`/users/${id}`),
  updateProfile: (id: string, data: { displayName: string; bio?: string; avatarUrl?: string }) =>
    api.put(`/users/${id}`, data),
  deleteAvatar: (id: string) =>
    api.delete(`/users/${id}/avatar`),
  getQuestions: (id: string) =>
    api.get(`/users/${id}/questions`),
  getAnswers: (id: string) =>
    api.get(`/users/${id}/answers`),
};

// Tags
export const tagAPI = {
  getAll: () =>
    api.get('/tags'),
  getBySlug: (slug: string) =>
    api.get(`/tags/${slug}`),
  create: (data: { name: string; slug: string; description?: string }) =>
    api.post('/tags', data),
  update: (id: string, data: { name: string; slug: string; description?: string }) =>
    api.put(`/tags/${id}`, data),
  delete: (id: string) =>
    api.delete(`/tags/${id}`),
};

// Notifications
export const notificationAPI = {
  getAll: () =>
    api.get('/notifications'),
  markAsRead: (id: string) =>
    api.post(`/notifications/${id}/read`),
  markAllAsRead: () =>
    api.post('/notifications/read-all'),
};

// Admin
export const adminAPI = {
  getUsers: () =>
    api.get('/admin/users'),
  banUser: (id: string) =>
    api.post(`/admin/users/${id}/ban`),
  unbanUser: (id: string) =>
    api.post(`/admin/users/${id}/unban`),
  deleteUser: (id: string) =>
    api.delete(`/admin/users/${id}`),
  verifyUser: (id: string) =>
    api.post(`/admin/users/${id}/verify`),
  unverifyUser: (id: string) =>
    api.post(`/admin/users/${id}/unverify`),
  getQuestions: () =>
    api.get('/admin/questions'),
  deleteQuestion: (id: string) =>
    api.delete(`/admin/questions/${id}`),
  deleteAnswer: (id: string) =>
    api.delete(`/admin/answers/${id}`),
  deleteComment: (id: string) =>
    api.delete(`/admin/comments/${id}`),
  getCommunities: () =>
    api.get('/admin/communities'),
  banCommunity: (id: string) =>
    api.post(`/admin/communities/${id}/ban`),
  unbanCommunity: (id: string) =>
    api.post(`/admin/communities/${id}/unban`),
  getStats: () =>
    api.get('/admin/stats'),
};

// Bookmark API
export const bookmarkAPI = {
  getAll: () =>
    api.get('/bookmarks'),
  add: (questionId: string) =>
    api.post('/bookmarks', { questionId }),
  remove: (questionId: string) =>
    api.delete(`/bookmarks?questionId=${questionId}`),
};

// Community API
export const communityAPI = {
  getAll: (params?: { search?: string; category?: string; page?: number; limit?: number }) =>
    api.get('/communities', { params }),
  getById: (id: string) =>
    api.get(`/communities/${id}`),
  create: (data: { name: string; description: string; category: string; location?: string }) =>
    api.post('/communities', data),
  join: (id: string) =>
    api.post(`/communities/${id}/join`),
  getMembers: (id: string) =>
    api.get(`/communities/${id}/members`),
};
