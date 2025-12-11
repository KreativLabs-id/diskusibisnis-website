/**
 * API Client for Frontend
 * Centralized API communication with Express backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

/**
 * Make authenticated API request
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  // Get token from localStorage (for backward compatibility)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: 'include', // Required for HttpOnly cookies
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

/**
 * API Client Methods
 */
export const api = {
  // Auth
  auth: {
    login: (email: string, password: string) =>
      apiRequest('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      }),
    register: (data: any) =>
      apiRequest('/api/auth/register', {
        method: 'POST',
        body: data,
      }),
    logout: () => apiRequest('/api/auth/logout', { method: 'POST' }),
    me: () => apiRequest('/api/auth/me'),
  },

  // Questions
  questions: {
    getAll: (params?: any) => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return apiRequest(`/api/questions${query}`);
    },
    getById: (id: string) => apiRequest(`/api/questions/${id}`),
    create: (data: any) =>
      apiRequest('/api/questions', {
        method: 'POST',
        body: data,
      }),
    update: (id: string, data: any) =>
      apiRequest(`/api/questions/${id}`, {
        method: 'PUT',
        body: data,
      }),
    delete: (id: string) =>
      apiRequest(`/api/questions/${id}`, {
        method: 'DELETE',
      }),
  },

  // Answers
  answers: {
    getByQuestion: (questionId: string) =>
      apiRequest(`/api/answers/question/${questionId}`),
    create: (data: any) =>
      apiRequest('/api/answers', {
        method: 'POST',
        body: data,
      }),
    update: (id: string, data: any) =>
      apiRequest(`/api/answers/${id}`, {
        method: 'PUT',
        body: data,
      }),
    delete: (id: string) =>
      apiRequest(`/api/answers/${id}`, {
        method: 'DELETE',
      }),
    accept: (id: string) =>
      apiRequest(`/api/answers/${id}/accept`, {
        method: 'POST',
      }),
  },

  // Communities
  communities: {
    getAll: (params?: any) => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return apiRequest(`/api/communities${query}`);
    },
    getBySlug: (slug: string) => apiRequest(`/api/communities/${slug}`),
    create: (data: any) =>
      apiRequest('/api/communities', {
        method: 'POST',
        body: data,
      }),
    update: (id: string, data: any) =>
      apiRequest(`/api/communities/${id}`, {
        method: 'PUT',
        body: data,
      }),
    delete: (id: string) =>
      apiRequest(`/api/communities/${id}`, {
        method: 'DELETE',
      }),
    join: (id: string) =>
      apiRequest(`/api/communities/${id}/join`, {
        method: 'POST',
      }),
    leave: (id: string) =>
      apiRequest(`/api/communities/${id}/leave`, {
        method: 'POST',
      }),
  },

  // Votes
  votes: {
    vote: (targetType: 'question' | 'answer', targetId: string, voteType: number) =>
      apiRequest('/api/votes', {
        method: 'POST',
        body: { target_type: targetType, target_id: targetId, vote_type: voteType },
      }),
  },

  // Bookmarks
  bookmarks: {
    getAll: () => apiRequest('/api/bookmarks'),
    toggle: (questionId: string) =>
      apiRequest('/api/bookmarks/toggle', {
        method: 'POST',
        body: { question_id: questionId },
      }),
  },

  // Comments
  comments: {
    create: (data: any) =>
      apiRequest('/api/comments', {
        method: 'POST',
        body: data,
      }),
    update: (id: string, content: string) =>
      apiRequest(`/api/comments/${id}`, {
        method: 'PUT',
        body: { content },
      }),
    delete: (id: string) =>
      apiRequest(`/api/comments/${id}`, {
        method: 'DELETE',
      }),
  },

  // Users
  users: {
    getAll: (params?: any) => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return apiRequest(`/api/users${query}`);
    },
    getById: (id: string) => apiRequest(`/api/users/${id}`),
    updateProfile: (data: any) =>
      apiRequest('/api/users/profile', {
        method: 'PUT',
        body: data,
      }),
  },

  // Tags
  tags: {
    getAll: (params?: any) => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return apiRequest(`/api/tags${query}`);
    },
    getBySlug: (slug: string) => apiRequest(`/api/tags/${slug}`),
  },

  // Notifications
  notifications: {
    getAll: () => apiRequest('/api/notifications'),
    markAsRead: (id: string) =>
      apiRequest(`/api/notifications/${id}/read`, {
        method: 'PUT',
      }),
    markAllAsRead: () =>
      apiRequest('/api/notifications/read-all', {
        method: 'PUT',
      }),
  },

  // Admin
  admin: {
    getStats: () => apiRequest('/api/admin/stats'),
    users: {
      getAll: () => apiRequest('/api/admin/users'),
      updateRole: (userId: string, role: string) =>
        apiRequest(`/api/admin/users/${userId}/role`, {
          method: 'PUT',
          body: { role },
        }),
      ban: (userId: string) =>
        apiRequest(`/api/admin/users/${userId}/ban`, {
          method: 'POST',
        }),
    },
    communities: {
      getAll: () => apiRequest('/api/admin/communities'),
      update: (id: string, data: any) =>
        apiRequest(`/api/admin/communities/${id}`, {
          method: 'PUT',
          body: data,
        }),
      delete: (id: string) =>
        apiRequest(`/api/admin/communities/${id}`, {
          method: 'DELETE',
        }),
    },
    questions: {
      getAll: () => apiRequest('/api/admin/questions'),
      delete: (id: string) =>
        apiRequest(`/api/admin/questions/${id}`, {
          method: 'DELETE',
        }),
    },
  },
};

export default api;
